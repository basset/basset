const Asset = require('../models/Asset');
const Organization = require('../models/Organization');
const Project = require('../models/Project');
const ApiToken = require('../models/ApiToken');

const { paginateQuery } = require('../utils/graphql/paginate');
const {
  getModelLoader,
  getRelatedLoader,
} = require('../utils/graphql/dataloader');

const typeDefs = `
type ApiToken implements Node {
  id: ID!
  clientKey: String
  publicKey: String
  createdAt: String
  project: Project
  organization: Organization
}
type ApiTokenConnection {
  pageInfo: PageInfo!
  edges: [ApiTokenEdge]
  totalCount: Int
}
type ApiTokenEdge {
  cursor: String!
  node: ApiToken
}
extend type Query {
  tokens(first: Int, last: Int, after: String, before: String, organizationId: ID, projectId: ID): ApiTokenConnection @authField @cost(multipliers: ["first", "last"], complexity: 1)
  token(id: ID!): ApiToken @authField
}
`;

const resolvers = {
  Query: {
    asset: async (object, { id }, context, info) => {
      const { user } = context.req;
      return Asset.authorizationFilter(user).findById(id);
    },
    assets: async (
      object,
      { organizationId, projectId, ...args },
      context,
      info,
    ) => {
      const { user } = context.req;
      if (!projectId && !organizationId) {
        throw new Error('you must filter by a project or organization');
      }
      let query = Asset.authorizationFilter(user);

      if (organizationId) {
        query = query.where('organizationId', organizationId);
      }

      if (projectId) {
        query = query.where('projectId', projectId);
      }

      return paginateQuery(context, query, {
        ...args,
        orderByPrefix: 'apiToken',
      });
    },
  },
  Asset: {
    organization: (asset, args, context, info) =>
      getModelLoader(context, Organization).load(asset.organizationId),
    project: (asset, args, context, info) =>
      getModelLoader(context, Project).load(asset.projectId),
  },
};

module.exports = {
  typeDefs,
  resolvers,
};
