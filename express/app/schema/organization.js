const Organization = require('../models/Organization');
const OrganizationMember = require('../models/OrganizationMember');
const settings = require('../settings');

const { paginateQuery } = require('../utils/graphql/paginate');
const {
  getModelLoader,
} = require('../utils/graphql/dataloader');

const typeDefs = `
type Organization implements Node {
  id: ID!
  name: String
  admin: Boolean
  canCreate: Boolean
  monthlySnapshotLimit: Int
  currentSnapshotCount: Int
  enforceSnapshotLimit: Boolean
  buildRetentionPeriod: Int
  enforceBuildRetention: Boolean
  projects(first: Int, last: Int, after: String, before: String): ProjectConnection @cost(multipliers: ["first", "last"], complexity: 1)
  organizationMembers(first: Int, last: Int, after: String, before: String): OrganizationMemberConnection @cost(multipliers: ["first", "last"], complexity: 1)
}
type OrganizationConnection {
  pageInfo: PageInfo
  edges: [OrganizationEdge]
  totalCount: Int
}
type OrganizationEdge {
  cursor: String!
  node: Organization
}
extend type Query {
  organizations(first: Int, last: Int, after: String, before: String): OrganizationConnection @authField @cost(multipliers: ["first", "last"], complexity: 1)
  organization(id: ID!): Organization @authField
}
extend type Mutation {
  createOrganization(name: String!): Organization @authField
  editOrganization(id: ID!, name: String!): Organization @authField
  deleteOrganization(id: ID!): Boolean @authField
}
`;

const resolvers = {
  Query: {
    organization: async (object, { id }, context, info) => {
      const { user } = context.req;
      const organization = await getModelLoader(context, Organization).load(id);
      if (await organization.canRead(user)) {
        return organization;
      }
      return null;
    },
    organizations: async (object, args, context, info) => {
      const { user } = context.req;
      const query = Organization.authorizationFilter(user);

      return paginateQuery(context, query, {
        ...args,
        orderByPrefix: 'organization',
      });
    },
  },
  Organization: {
    projects: async (organization, args, context, info) => {
      const query = organization.$relatedQuery('projects');
      return paginateQuery(context, query, {
        ...args,
        orderByPrefix: 'project',
      });
    },
    admin: (organization, args, context, info) =>
      context.req.user.isAdmin(organization.id),
    organizationMembers: (organization, args, context, info) => {
      const query = organization.$relatedQuery('organizationMembers');
      return paginateQuery(context, query, {
        ...args,
        orderByPrefix: 'organizationMember',
      });
    },
  },
  Mutation: {
    createOrganization: async (object, { name }, context, info) => {
      const { user } = context.req;
      let organization = Organization.fromJson({
        name,
      });

      if (!(await organization.canCreate(user))) {
        throw new Error('You do not have permission to create organizations.');
      }
      organization = await organization.$query().insertAndFetch(organization);

      await OrganizationMember.query().insertAndFetch({
        organizationId: organization.id,
        userId: user.id,
        enforceSnapshotLimit: settings.enforceSnapshotLimit,
        enforceBuildRetention: settings.enforceBuildRetention,
        admin: true,
      });
      return organization;
    },
    editOrganization: async (object, { id, name }, context, info) => {
      const { user } = context.req;
      const organization = await Organization.authorizationFilter(
        user,
      ).findById(id);
      if (!organization) {
        throw new Error(
          'Organization does not exist or you do not have permission to edit it.',
        );
      }
      if (!(await organization.canEdit(user))) {
        throw new Error(
          'You do not have permission to edit this organization.',
        );
      }

      return organization.$query().updateAndFetch({
        name,
      });
    },
    deleteOrganization: async (object, { id }, context, info) => {
      const { user } = context.req;
      const organization = await Organization.authorizationFilter(
        user,
      ).findById(id);

      if (!organization) {
        throw new Error(
          'Organization does not exist or you do not have permission to delete it.',
        );
      }
      if (!(await organization.canDelete(user))) {
        throw new Error(
          'You do not have permission to delete this organization.',
        );
      }

      await organization.$query().delete();
      return true;
    },
  },
};

module.exports = {
  typeDefs,
  resolvers,
};
