const Snapshot = require('../models/Snapshot');
const SnapshotDiff = require('../models/SnapshotDiff');
const SnapshotFlake = require('../models/SnapshotFlake');
const Build = require('../models/Build');
const Asset = require('../models/Asset');
const Organization = require('../models/Organization');
const OrganizationMember = require('../models/OrganizationMember');
const Project = require('../models/Project');

const { paginateQuery } = require('../utils/graphql/paginate');
const {
  getModelLoader,
  getRelatedLoader,
} = require('../utils/graphql/dataloader');
const { copySnapshotDiffToFlake } = require('../utils/upload');

const typeDefs = `
enum SnapshotType {
  NEW
  MODIFIED
  UNMODIFIED
  REMOVED
  FLAKE
}
type SnapshotFlake implements Node {
  id: ID!
  imageLocation: String
  ignoredCount: Int
  updatedAt: String
  createdAt: String
  createdBy: OrganizationMember
}
type SnapshotDiff implements Node {
  id: ID!
  imageLocation: String
  snapshotToId: ID
  snapshotFromId: ID
}
type Snapshot implements Node {
  id: ID!
  title: String
  width: Int
  diff: Boolean
  browser: String
  imageLocation: String
  approved: Boolean
  approvedOn: String
  approvedBy: OrganizationMember
  project: Project
  projectId: ID
  build: Build
  buildId: ID
  organization: Organization
  organizationId: ID
  previousApproved: Snapshot
  snapshotDiff: SnapshotDiff
  snapshotFlake: SnapshotFlake
  snapshotFlakeMatched: SnapshotFlake
}
type SnapshotConnection {
  pageInfo: PageInfo!
  edges: [SnapshotEdge]
  totalCount: Int
}
type SnapshotEdge {
  cursor: String!
  node: Snapshot
}
type SnapshotGroup {
  group: Int
  buildId: ID
  approvedSnapshots: Int
  snapshots(first: Int, last: Int, after: String, before: String): SnapshotConnection @cost(multipliers: ["first", "last"], complexity: 2)
}
type SnapshotGroupConnection {
  edges: [SnapshotGroupEdge]
  totalCount: Int
}
type SnapshotGroupEdge {
  cursor: String!
  node: SnapshotGroup
}
extend type Query {
  snapshots(first: Int, last: Int, after: String, before: String, buildId: ID!, title: String, type: SnapshotType): SnapshotConnection @authField @cost(multipliers: ["first", "last"], complexity: 2)
  snapshot(id: ID!): Snapshot @authField
  removedSnapshots(first: Int, last: Int, after: String, before: String, buildId: ID!): SnapshotConnection @authField @cost(multipliers: ["first", "last"], complexity: 2)
  modifiedSnapshots(first: Int, last: Int, after: String, before: String, buildId: ID!, group: Int): SnapshotConnection @authField @cost(multipliers: ["first", "last"], complexity: 2)
  modifiedSnapshotGroups(limit: Int!, offset: Int!, buildId: ID!): SnapshotGroupConnection @authField @cost(multipliers: ["first", "last"], complexity: 2)
  unmodifiedSnapshots(first: Int, last: Int, after: String, before: String, buildId: ID!): SnapshotConnection @authField @cost(multipliers: ["first", "last"], complexity: 2)
}
extend type Mutation {
  approveSnapshot(id: ID!): Snapshot
  approveSnapshots(buildId: ID!): Boolean
  approveGroupSnapshots(buildId: ID!, group: Int!): Boolean
  addSnapshotFlake(id: ID!): SnapshotFlake
}
`;

const resolvers = {
  Query: {
    snapshot: async (object, { id }, context, info) => {
      const { user } = context.req;
      const snapshot = await getModelLoader(context, Snapshot).load(id);
      if (await snapshot.canRead(user)) {
        return snapshot;
      }
      return null;
    },
    snapshots: async (object, { buildId, type, ...args }, context, info) => {
      const { user } = context.req;
      let query;

      if (type === 'REMOVED') {
        const build = await Build.query().findById(buildId);
        if (!(await build.canRead(user))) {
          throw new Error(
            'Build does not exist or you do not have permission to view it',
          );
        }

        query = Snapshot.query()
          .where('buildId', build.previousBuildId)
          .where(builder => {
            builder.where('approved', true).orWhere('diff', false);
          })
          .whereNotExists(builder => {
            builder
              .select('*')
              .from('snapshot as s')
              .where('buildId', build.id)
              .whereRaw('s.title = snapshot.title')
              .whereRaw('s.width = snapshot.width')
              .whereRaw('s.browser = snapshot.browser');
          });
      } else {
        query = Snapshot.authorizationFilter(user);

        query
          .leftOuterJoinRelation('previousApproved')
          .leftOuterJoinRelation('snapshotDiff')
          .where('snapshot.buildId', buildId);

        if (type === 'NEW') {
          query.whereNull('previousApproved.id');
        } else if (type === 'MODIFIED') {
          query
            .whereNotNull('snapshotDiff.id')
            .whereNotNull('previousApproved.id')
            .whereNull('snapshotDiff.group')
            .where('snapshot.flake', false);
        } else if (type === 'UNMODIFIED') {
          query
            .whereNull('snapshotDiff.id')
            .whereNotNull('previousApproved.id');
        } else if (type === 'FLAKE') {
          query.where('snapshot.flake', true);
        }
      }

      if (args.title) {
        query.where('snapshot.title', 'like', `%${args.title}%`);
      }

      return paginateQuery(context, query, {
        ...args,
        orderByPrefix: 'snapshot',
      });
    },
    removedSnapshots: async (object, { buildId, ...args }, context, info) => {
      const { user } = context.req;
      const build = await Build.query().findById(buildId);
      if (!(await build.canRead(user))) {
        throw new Error(
          'Build does not exist or you do not have permission to view it',
        );
      }

      const lastCompletedBuild = await Build.query()
        .where('projectId', build.projectId)
        .where(
          'completedAt',
          Build.query()
            .where('projectId', build.projectId)
            .where('completedAt', '<', build.completedAt)
            .max('completedAt')
            .first(),
        )
        .first();

      if (!lastCompletedBuild) {
        return;
      }

      const query = Snapshot.query()
        .where('buildId', lastCompletedBuild.id)
        .where('approved', true)
        .whereNotIn(
          'title',
          Snapshot.query()
            .select('title')
            .where('buildId', buildId),
        );

      return paginateQuery(context, query, {
        ...args,
        orderByPrefix: 'snapshot',
      });
    },
    modifiedSnapshots: async (
      object,
      { buildId, group, ...args },
      context,
      info,
    ) => {
      const { user } = context.req;
      const query = Snapshot.authorizationFilter(user);

      query
        .joinRelation('snapshotDiff')
        .joinRelation('previousApproved')
        .where('snapshot.buildId', buildId);

      if (group) {
        query.where('snapshotDiff.group', group);
      } else {
        query.whereNull('snapshotDiff.group');
      }

      return paginateQuery(context, query, {
        ...args,
        orderByPrefix: 'snapshot',
      });
    },
    modifiedSnapshotGroups: async (
      object,
      { buildId, limit, offset },
      context,
      info,
    ) => {
      const { user } = context.req;
      const query = Snapshot.authorizationFilter(user);
      const pageQuery = query
        .joinRelation('snapshotDiff')
        .where('snapshot.buildId', buildId);
      return {
        totalCount: pageQuery
          .clone()
          .distinct('group')
          .then(r => r.length),
        edges: pageQuery
          .clone()
          .distinct('group')
          .limit(limit)
          .offset(offset)
          .map(result => ({
            node: {
              ...result,
              buildId,
            },
          })),
      };
    },
    unmodifiedSnapshots: async (
      object,
      { buildId, ...args },
      context,
      info,
    ) => {
      const { user } = context.req;
      const query = Snapshot.authorizationFilter(user);
      query
        .leftOuterJoinRelation('snapshotDiff')
        .leftOuterJoinRelation('previousApproved')
        .where('snapshot.buildId', buildId)
        .where('snapshotDiff.id', null)
        .whereNot('previousApproved.id', null);

      return paginateQuery(context, query, {
        ...args,
        orderByPrefix: 'snapshot',
      });
    },
  },
  Snapshot: {
    build: (snapshot, args, context, info) =>
      getModelLoader(context, Asset).load(snapshot.buildId),
    organization: (snapshot, args, context, info) =>
      getModelLoader(context, Organization).load(snapshot.organizationId),
    project: (snapshot, args, context, info) =>
      getModelLoader(context, Project).load(snapshot.projectId),
    approvedBy: (snapshot, args, context, info) =>
      snapshot.approvedById
        ? getModelLoader(context, OrganizationMember).load(
            snapshot.approvedById,
          )
        : null,
    previousApproved: (snapshot, args, context, info) =>
      snapshot.previousApprovedId
        ? getModelLoader(context, Snapshot).load(snapshot.previousApprovedId)
        : null,
    snapshotDiff: (snapshot, args, context, info) =>
      getModelLoader(context, SnapshotDiff, { prop: 'snapshotToId' }).load(
        snapshot.id,
      ),
    snapshotFlake: (snapshot, args, context, info) =>
      getModelLoader(context, SnapshotFlake, { prop: 'snapshotId' }).load(
        snapshot.id,
      ),
    snapshotFlakeMatched: (snapshot, args, context, info) =>
      getModelLoader(context, SnapshotFlake).load(
        snapshot.snapshotFlakeMatchedId,
      ),
  },
  SnapshotFlake: {
    createdBy: (snapshotFlake, args, context, info) =>
      snapshotFlake.createdById
        ? getModelLoader(context, OrganizationMember).load(
            snapshotFlake.createdById,
          )
        : null,
  },
  SnapshotGroup: {
    approvedSnapshots: (group, args, context, info) => {
      const { user } = context.req;
      const query = Snapshot.authorizationFilter(user);
      return query
        .joinRelation('snapshotDiff')
        .joinRelation('previousApproved')
        .where('snapshot.buildId', group.buildId)
        .where('snapshotDiff.group', group.group)
        .where('snapshot.approved', true)
        .where('snapshot.diff', true)
        .count()
        .first()
        .then(r => r.count);
    },
    snapshots: (group, args, context, info) => {
      const { user } = context.req;
      const query = Snapshot.authorizationFilter(user);

      query
        .joinRelation('snapshotDiff')
        .joinRelation('previousApproved')
        .where('snapshot.buildId', group.buildId)
        .where('snapshot.flake', false)
        .where('snapshotDiff.group', group.group);

      return paginateQuery(context, query, {
        ...args,
        orderByPrefix: 'snapshot',
      });
    },
  },
  Mutation: {
    addSnapshotFlake: async (root, { id }, context, info) => {
      const { user } = context.req;
      const snapshot = await Snapshot.authorizationFilter(user).findById(id);

      const member = await OrganizationMember.query()
        .where('userId', user.id)
        .first();

      if (!member) {
        throw new Error(
          'Snapshot does not exist or you do not have permission to it.',
        );
      }

      if (!snapshot) {
        throw new Error(
          'Snapshot does not exist or you do not have permission to it.',
        );
      }

      if (!(await snapshot.canEdit(user))) {
        throw new Error('You do not have permission to edit this snapshot.');
      }

      const snapshotDiff = await snapshot.$relatedQuery('snapshotDiff');

      if (!snapshotDiff) {
        throw new Error(
          'Snapshot Diff does not exit or you do not have permission to it.',
        );
      }

      const imageLocation = await copySnapshotDiffToFlake(
        snapshotDiff,
        snapshot,
      );

      return SnapshotFlake.query().insertAndFetch({
        title: snapshot.title,
        width: snapshot.width,
        snapshotId: snapshot.id,
        snapshotDiffId: snapshotDiff.id,
        imageLocation,
        sha: snapshotDiff.sha,
        createdById: member.id,
        organizationId: snapshot.organizationId,
        projectId: snapshot.projectId,
      });
    },
    approveSnapshot: async (root, { id }, context, info) => {
      const { user } = context.req;
      const snapshot = await Snapshot.authorizationFilter(user).findById(id);

      const member = await OrganizationMember.query()
        .where('userId', user.id)
        .first();

      if (!member) {
        throw new Error(
          'Snapshot does not exist or you do not have permission to it.',
        );
      }

      if (!snapshot) {
        throw new Error(
          'Snapshot does not exist or you do not have permission to it.',
        );
      }

      if (!(await snapshot.canEdit(user))) {
        throw new Error('You do not have permission to edit this snapshot.');
      }

      if (snapshot.approved || !snapshot.diff || snapshot.flake) {
        throw new Error(
          'This snapshot has already been approved or doesnt require approving.',
        );
      }
      const { modifiedSnapshotCount } = await Snapshot.query()
        .where('buildId', snapshot.buildId)
        .where('diff', true)
        .count('id as modifiedSnapshotCount')
        .first();

      if (parseInt(modifiedSnapshotCount) === 0) {
        const build = await snapshot.$relatedQuery('build');
        await build.notifyApproved(null, project);
      }
      return snapshot.$query().updateAndFetch({
        approved: true,
        approvedById: member.id,
        approvedOn: Snapshot.knex().fn.now(),
      });
    },
    approveSnapshots: async (root, { buildId }, context, info) => {
      const { user } = context.req;
      const build = await Build.authorizationFilter(user).findById(buildId);

      const member = await OrganizationMember.query()
        .where('userId', user.id)
        .first();

      if (!member || !build) {
        throw new Error(
          'Build does not exist or you do not have permission to it.',
        );
      }

      if (!(await build.canEdit(user))) {
        throw new Error(
          'You do not have permission to approve this build’s snapshots.',
        );
      }
      const approvedOn = Snapshot.knex().fn.now();

      const ids = await Snapshot.query()
        .where('buildId', build.id)
        .where('approved', false)
        .where('diff', true)
        .map(s => s.id);

      await Snapshot.query()
        .update({
          approved: true,
          approvedById: member.id,
          approvedOn,
        })
        .whereIn('id', ids);
      build.notifyApproved();
      return true;
    },
    approveGroupSnapshots: async (
      root,
      { buildId, group },
      context,
      info,
    ) => {
      const { user } = context.req;
      const build = await Build.authorizationFilter(user).findById(buildId);

      const member = await OrganizationMember.query()
        .where('userId', user.id)
        .first();

      if (!member || !build) {
        throw new Error(
          'Build does not exist or you do not have permission to it.',
        );
      }

      if (!(await build.canEdit(user))) {
        throw new Error(
          'You do not have permission to approve this build’s snapshots.',
        );
      }
      const approvedOn = Snapshot.knex().fn.now();

      const ids = await Snapshot.query()
        .joinRelation('snapshotDiff')
        .where('snapshot.buildId', build.id)
        .where('snapshot.approved', false)
        .where('snapshot.diff', true)
        .where('snapshot.flake', false)
        .where('snapshotDiff.group', group)
        .map(s => s.id);

      await Snapshot.query()
        .update({
          approved: true,
          approvedById: member.id,
          approvedOn,
        })
        .whereIn('id', ids);

      const { modifiedSnapshotCount } = await Snapshot.query()
        .where('buildId', build.id)
        .where('diff', true)
        .count('id as modifiedSnapshotCount')
        .first();

      if (parseInt(modifiedSnapshotCount) === 0) {
        const build = await snapshot.$relatedQuery('build');
        await build.notifyApproved(null, project);
      }
      return true;
    },
  },
};

module.exports = {
  typeDefs,
  resolvers,
};
