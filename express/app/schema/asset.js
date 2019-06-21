const Asset = require('../models/Asset');
const Organization = require('../models/Organization');
const Project = require('../models/Project');

const { paginateQuery } = require('../utils/graphql/paginate');
const {
  getModelLoader,
  getRelatedLoader,
} = require('../utils/graphql/dataloader');

const typeDefs = `
type Asset implements Node {
  id: ID!
  sha: String
  project: Project
  organization: Organization
}
type AssetConnection {
  pageInfo: PageInfo!
  edges: [AssetEdge]
  totalCount: Int
}
type AssetEdge {
  cursor: String!
  node: Asset
}
extend type Query {
  assets(first: Int, last: Int, after: String, before: String, organizationId: ID, projectId: ID): AssetConnection @authField @cost(multipliers: ["first, last"], complexity: 1)
  asset(id: ID!): Asset @authField
}
`;

const resolvers = {
  Query: {
    asset: async (object, { id }, context, info) => {
      const { user } = context.req;
      const asset = await getModelLoader(context, Asset).load(id);
      if (await asset.canRead(user)) {
        return asset;
      }
      return null;
    },
    assets: async (
      object,
      { limit, offset, organizationId, projectId, buildId },
      context,
      info,
    ) => {
      const { user } = context.req;
      if (!projectId && !organizationId) {
        throw new Error('you must filter by a project or organization');
      }
      const query = Asset.authorizationFilter(user);

      if (organizationId) {
        query.where('organizationId', organizationId);
      }

      if (projectId) {
        query.where('projectId', projectId);
      }

      return paginateQuery(context, query, limit, offset);
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
