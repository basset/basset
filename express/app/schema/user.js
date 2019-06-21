const { transaction } = require('objection');

const User = require('../models/User');
const UserProvider = require('../models/UserProvider');
const OrganizationMember = require('../models/OrganizationMember');
const Organization = require('../models/Organization');

const { paginateQuery } = require('../utils/graphql/paginate');
const {
  getModelLoader,
  getRelatedModelLoader,
} = require('../utils/graphql/dataloader');

const { attemptLogin } = require('../utils/auth/login');
const {
  activateUserFromToken,
  createUser,
  validateToken,
} = require('../utils/registration');
const {
  sendPasswordResetEmail,
  sendActivationEmail,
} = require('../utils/email');

const typeDefs = `
type ProviderConnection {
  edges: [ProviderEdge]
  pageInfo: PageInfo!
  totalCount: Int
}
type ProviderEdge {
  cursor: String!
  node: Provider
}
type Provider {
  id: ID!
  user: User
  provider: String
}
type User implements Node {
  id: ID!
  email: String
  name: String
  admin: Boolean
  createdAt: String
  updatedAt: String
  lastLogin: String
  active: Boolean
  profileImage: String
  canCreateOrganizations: Boolean
  providers(first: Int, last: Int, after: String, before: String): ProviderConnection @cost(multipliers: ["limit"], complexity: 1)
  organizations(first: Int, last: Int, after: String, before: String): OrganizationConnection @cost(multipliers: ["limit"], complexity: 1)
  organizationMembership(first: Int, last: Int, after: String, before: String): OrganizationMemberConnection @cost(multipliers: ["limit"], complexity: 1)
}
type UserConnection {
  edges: [UserEdge]
  pageInfo: PageInfo!
}
type UserEdge {
  cursor: String!
  node: User
}
extend type Query {
  users(first: Int, last: Int, after: String, before: String, organizationId: ID!): UserConnection @authField @cost(multipliers: ["first", "last"], complexity: 1)
  user(id: ID!): User @authField
  validResetPassword(id: String!, token: String!): Boolean
  validActivate(id: String!, token: String!): Boolean
  whoami: User
}
extend type Mutation {
  login(email: String!, password: String!): User
  logout: Boolean @authField
  signUp(email: String!, password: String!, name: String!): User
  forgotPassword(email: String!): Boolean
  resetPassword(id: String!, token: String!, password: String!): Boolean
  resendActivationEmail(email: String!): Boolean
  activate(id: String!, token: String!): User
  editUser(name: String!): User @authField
  deleteUser(id: ID!): Boolean @authField
  changePassword(password: String!): Boolean @authField
}
`;

const resolvers = {
  Query: {
    whoami: async (object, args, context, info) => {
      if (!context.req.isAuthenticated || !context.req.isAuthenticated()) {
        return null;
      }
      const { user } = context.req;
      return user;
    },
    user: async (object, { id }, context, info) => {
      const { user } = context.req;
      const userData = await getModelLoader(context, User).load(id);
      if (await userData.canRead(user)) {
        return userData;
      }
      return null;
    },
    users: async (object, { organizationId, ...args }, context, info) => {
      const { user } = context.req;
      const query = User.authorizationFilter(user).where(
        'organizations.id',
        organizationId,
      );

      return paginateQuery(context, query, { ...args, orderByPrefix: 'user' });
    },
    validResetPassword: async (object, { id, token }, context, info) => {
      await validateToken(id, token, { active: true });
      return true;
    },
    validActivate: async (object, { id, token }, context, info) => {
      await validateToken(id, token);
      return true;
    },
  },
  User: {
    organizations: async (user, args, context, info) => {
      const query = Organization.query()
        .joinRelation('organizationMembers')
        .where('organizationMembers.userId', user.id);
      return paginateQuery(context, query, { ...args, orderByPrefix: 'user' });
    },
    organizationMembership: (user, args, context, info) => {
      const query = OrganizationMember.query().where('userId', user.id);
      return paginateQuery(context, query, { ...args, orderByPrefix: 'user' });
    },
    providers: async (user, args, context, info) => {
      const query = UserProvider.query().where('userId', user.id);
      return paginateQuery(context, query, { ...args, orderByPrefix: 'user' });
    },
  },
  Mutation: {
    resetPassword: async (object, { id, token, password }, context, info) => {
      const user = await validateToken(id, token, { active: true });
      await user.changePassword(password);
      return true;
    },
    changePassword: async (object, { password }, context, info) => {
      const user = context.req.user;
      await user.changePassword(password);
      return true;
    },
    editUser: async (object, { name }, context, info) => {
      const user = context.req.user;
      return user.$query().updateAndFetch({
        name,
      });
    },
    deleteUser: async (object, { id }, context, info) => {
      const requester = context.req.user;
      if (!requester.admin) {
        throw new Error('Only admins can delete users.');
      }
      const user = await User.query().findById(id);
      if (!user) {
        throw new Error('User does not exist.');
      }
      await user.$query().delete();
      return true;
    },
    logout: async (object, args, context, info) => {
      context.req.logout();
      return true;
    },
    login: async (object, { email, password }, context, info) =>
      attemptLogin(context, email, password),
    signUp: async (object, { email, password, name }, context, info) => {
      const user = await User.query()
        .where('email', email)
        .first();
      if (user) {
        throw new Error('Cannot register with this email address.');
      }
      let trx;
      try {
        trx = await transaction.start(User.knex());
        const user = await createUser(
          trx,
          { email, password, name, active: false },
          { sendEmail: true },
        );
        await trx.commit();

        return user;
      } catch (err) {
        await trx.rollback();
        throw err;
      }
    },
    resendActivationEmail: async (object, { email }, context, info) => {
      const user = await User.query()
        .where('email', email)
        .first();
      if (user) {
        sendActivationEmail(user);
      }
      return true;
    },
    forgotPassword: async (object, { email }, context, info) => {
      const user = await User.query()
        .where('email', email)
        .first();
      if (user) {
        sendPasswordResetEmail(user);
      }
      return true;
    },
    activate: async (object, { id, token }, context, info) => {
      let trx;
      try {
        trx = await transaction.start(User.knex());
        const user = await activateUserFromToken(trx, context.req, id, token);
        await trx.commit();

        return user;
      } catch (err) {
        await trx.rollback();
        throw err;
      }
    },
  },
};

module.exports = {
  typeDefs,
  resolvers,
};
