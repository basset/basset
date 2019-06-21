const OrganizationMember = require('../models/OrganizationMember');
const User = require('../models/User');

const { paginateQuery } = require('../utils/graphql/paginate');
const { getModelLoader } = require('../utils/graphql/dataloader');

const typeDefs = `
type OrganizationMember implements Node {
  id: ID!
  createdAt: String
  updatedAt: String
  user: User
  organization: Organization
  admin: Boolean
  active: Boolean
}
type OrganizationMemberConnection {
  pageInfo: PageInfo!
  edges: [OrganizationMemberEdge]
  totalCount: Int
}
type OrganizationMemberEdge {
  cursor: String!
  node: OrganizationMember
}
input MemberInput {
  id: ID!
  admin: Boolean
  active: Boolean
} 
extend type Query {
  organizationMembers(first: Int, last: Int, after: String, before: String, organizationId: ID!): OrganizationMemberConnection @authField @cost(multipliers: ["first", "last"], complexity: 1)
  organizationMember(id: ID!): OrganizationMember @authField
}
extend type Mutation {
  updateMember(member: MemberInput): OrganizationMember @authField
  removeMember(id: ID!): Boolean @authField
}
`;

const resolvers = {
  Query: {
    organizationMember: async (object, { id }, context, info) => {
      const { user } = context.req;
      const member = await getModelLoader(context, OrganizationMember).load(id);
      if (await member.canRead(user)) {
        return member;
      }
      return null;
    },
    organizationMembers: async (
      object,
      { organizationId, ...args },
      context,
      info,
    ) => {
      const { user } = context.req;
      const query = OrganizationMember.authorizationFilter(user).where(
        'organizationId',
        organizationId,
      );
      return paginateQuery(context, query, {
        ...args,
        orderByPrefix: 'organizationMember',
      });
    },
  },
  OrganizationMember: {
    user: (organizationMember, args, context, info) =>
      getModelLoader(context, User).load(organizationMember.userId),
    organization: (organizationMember, args, context, info) =>
      getModelLoader(context, Organization).load(
        organizationMember.organizationId,
      ),
  },
  Mutation: {
    updateMember: async (object, { member }, context, info) => {
      const { user } = context.req;
      const organizationMember = await OrganizationMember.authorizationFilter(
        user,
      ).findById(member.id);

      if (!organizationMember) {
        throw new Error(
          'Organization does not exist or you do not have permission to edit it.',
        );
      }

      if (!(await organizationMember.canEdit(user))) {
        throw new Error(
          'You do not have permission to edit users from this organzation.',
        );
      }

      return organizationMember.$query().updateAndFetch({
        active: 'active' in member ? member.active : organizationMember.active,
        admin: 'admin' in member ? member.admin : organizationMember.admin,
      });
    },
    removeMember: async (object, { id }, context, info) => {
      const { user } = context.req;
      const organizationMember = await OrganizationMember.authorizationFilter(
        user,
      ).findById(id);

      if (!organizationMember) {
        throw new Error(
          'Organization does not exist or you do not have permission to edit it.',
        );
      }

      if (
        organizationMember.userId !== user.id &&
        !(await organizationMember.canDelete(user))
      ) {
        throw new Error(
          'You do not have permission to remove users from this organzation.',
        );
      }

      await organizationMember.$query().delete();

      return true;
    },
  },
};

module.exports = {
  typeDefs,
  resolvers,
};
