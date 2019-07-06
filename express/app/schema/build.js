const Build = require('../models/Build');
const Organization = require('../models/Organization');
const Project = require('../models/Project');

const { paginateQuery } = require('../utils/graphql/paginate');
const {
  getModelLoader,
  primeLoaders,
  getRelatedLoader,
} = require('../utils/graphql/dataloader');
const { getFieldNames } = require('../utils/graphql/getFieldNames');

const typeDefs = `
type Build implements Node {
  id: ID!
  number: Int
  branch: String
  commitSha: String
  commitMessage: String
  committerName: String
  committerEmail: String
  commitDate: String
  authorName: String
  authorDate: String
  authorEmail: String
  createdAt: String
  updatedAt: String
  completedAt: String
  cancelledAt: String
  submittedAt: String
  approvedSnapshots: Int
  flakedSnapshots: Int
  newSnapshots: Int
  totalSnapshots: Int
  modifiedSnapshots: Int
  removedSnapshots: Int
  error: Boolean
  project: Project
  organization: Organization
  projectId: ID
  organizationId: ID
  previousBuild: Build
}
input BuildInput {
  branch: String!
  commitSha: String!
  commitMessage: String
  committerName: String
  committerEmail: String
  committerDate: String
  authorName: String
  authorDate: String
  authorEmail: String
}
type BuildConnection {
  pageInfo: PageInfo!
  edges: [BuildEdge]
  totalCount: Int
}
type BuildEdge {
  cursor: String!
  node: Build
}
extend type Query {
  builds(first: Int, last: Int, after: String, before: String, organizationId: ID, projectId: ID, orderBy: String, order: String): BuildConnection @authField @cost(multipliers: ["first, last"], complexity: 4)
  build(id: ID!): Build @authField
}
extend type Mutation {
  cancelBuild(id: ID!): Build
}
`;
const loadBuilds = async items => {
  const select = [
    'Build.*',
    Build.relatedQuery('snapshots')
      .where('diff', true)
      .where(builder => {
        builder.where('approved', true).orWhere(builder => {
          builder.where('flake', true).whereNull('snapshotFlakeMatchedId');
        });
      })
      .count()
      .as('approvedSnapshots'),
    Build.relatedQuery('snapshots')
      .where('flake', true)
      .whereNotNull('snapshotFlakeMatched')
      .count()
      .as('flakedSnapshots'),
    Build.relatedQuery('snapshots')
      .count()
      .as('totalSnapshots'),
    Build.relatedQuery('snapshots')
      .leftOuterJoinRelation('previousApproved')
      .whereNull('previousApproved.id')
      .count()
      .as('newSnapshots'),
    Build.relatedQuery('snapshots')
      .where('diff', true)
      .count()
      .as('modifiedSnapshots'),
    Build.knex()
      .count()
      .as('removedSnapshots')
      .from('snapshot')
      .whereRaw('snapshot.build_id = build.previous_build_id')
      .where(builder => {
        builder
          .where('approved', true)
          .orWhere('diff', false)
          .orWhere('flake', true);
      })
      .whereNotExists(builder => {
        builder
          .select('*')
          .from('snapshot as s')
          .whereRaw('s.build_id = build.id')
          .whereRaw('s.title = snapshot.title')
          .whereRaw('s.width = snapshot.width')
          .whereRaw('s.browser = snapshot.browser');
      }),
  ];
  const rows = await Build.query()
    .select(select)
    .whereIn('id', items);
  return items.map(item => rows.find(r => r.id === item));
};

const resolvers = {
  Query: {
    build: async (object, { id }, context, info) => {
      const { user } = context.req;

      const build = await getModelLoader(context, Build, {
        loader: loadBuilds,
      }).load(id);
      if (await build.canRead(user)) {
        return build;
      }
      return null;
    },
    builds: async (
      object,
      { organizationId, projectId, orderBy, ...args },
      context,
      info,
    ) => {
      const { user } = context.req;
      if (!projectId && !organizationId) {
        throw new Error('you must filter by a project or organization');
      }
      let query = Build.authorizationFilter(user);

      if (organizationId) {
        query = query.where('organizationId', organizationId);
      }

      if (projectId) {
        query = query.where('projectId', projectId);
      }

      const select = ['build.*'];

      const fields = getFieldNames(info.fieldNodes[0]);
      if (fields.includes('approvedSnapshots')) {
        select.push(
          Build.relatedQuery('snapshots')
            .where('diff', true)
            .where(builder => {
              builder.where('approved', true).orWhere(builder => {
                builder
                  .where('flake', true)
                  .whereNull('snapshotFlakeMatchedId');
              });
            })
            .count()
            .as('approvedSnapshots'),
        );
      }
      if (fields.includes('totalSnapshots')) {
        select.push(
          Build.relatedQuery('snapshots')
            .count()
            .as('totalSnapshots'),
        );
      }
      if (fields.includes('modifiedSnapshots')) {
        select.push(
          Build.relatedQuery('snapshots')
            .where('diff', true)
            .count()
            .as('modifiedSnapshots'),
        );
      }
      if (fields.includes('newSnapshots')) {
        select.push(
          Build.relatedQuery('snapshots')
            .leftOuterJoinRelation('previousApproved')
            .where('previousApproved.id', null)
            .count()
            .as('newSnapshots'),
        );
      }
      if (fields.includes('removedSnapshots')) {
        select.push(
          Build.knex()
            .count()
            .as('removedSnapshots')
            .from('snapshot')
            .whereRaw('snapshot.build_id = build.previous_build_id')
            .where(builder => {
              builder.where('approved', true).orWhere('diff', false);
            })
            .whereNotExists(builder => {
              builder
                .select('*')
                .from('snapshot as s')
                .whereRaw('s.build_id = build.id')
                .whereRaw('s.title = snapshot.title')
                .whereRaw('s.width = snapshot.width')
                .whereRaw('s.browser = snapshot.browser');
            }),
        );
      }

      query.select(select);

      const order = {};
      if (orderBy) {
        const isDesc = orderBy[0] === '-';
        const field = isDesc ? orderBy.slice(1) : orderBy;
        const fieldExists = Build.jsonSchema.properties.hasOwnProperty(field);
        order.orderByColumn = fieldExists ? field : 'createdAt';
        order.orderBy = isDesc ? 'desc' : 'asc';
      }

      return paginateQuery(context, query, {
        ...args,
        orderByPrefix: 'build',
        ...order,
      });
    },
  },
  Build: {
    organization: (build, args, context, info) =>
      getModelLoader(context, Organization).load(build.organizationId),
    project: (build, args, context, info) =>
      getModelLoader(context, Project).load(build.projectId),
    previousBuild: (build, args, context, info) =>
      build.previousBuildId
        ? getModelLoader(context, Build).load(build.previousBuildId)
        : null,
  },
  Mutation: {
    cancelBuild: async (object, { id }, context, info) => {
      const { user } = context.req;

      const build = await Build.authorizationFilter(user).findById(id);

      if (!build) {
        throw new Error(
          'Build does not exist or you do not have permission to modify builds.',
        );
      }

      if (!(await build.canEdit(user))) {
        throw new Error('You do not have permission to edit builds.');
      }

      if (build.completedAt) {
        throw new Error('Build has been completed.');
      }

      if (build.cancelledAt) {
        throw new Error('Build has already cancelled.');
      }

      return build.$query().updateAndFetch({
        cancelledAt: Project.knex().fn.now(),
      });
    },
  },
};

module.exports = {
  typeDefs,
  resolvers,
};
