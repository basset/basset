const { transaction } = require('objection');

const OrganizationMember = require('../models/OrganizationMember');
const User = require('../models/User');
const OrganizationInvite = require('../models/OrganizationInvite');
const Organization = require('../models/Organization');

const { paginateQuery } = require('../utils/graphql/paginate');
const { getModelLoader } = require('../utils/graphql/dataloader');

const { createUser, addUserToOrganization } = require('../utils/registration');
const { validateEmail } = require('../utils/validate');
const { sendInviteEmail } = require('../utils/email');
const { generateToken } = require('../utils/auth/token');

const typeDefs = `
type OrganizationInvite implements Node {
  id: ID!
  email: String
  token: String
  accepted: Boolean
  createdAt: String
  updatedAt: String
  fromMember: OrganizationMember
  organization: Organization
}
type OrganizationInviteConnection {
  pageInfo: PageInfo!
  edges: [OrganizationInviteEdge]
  totalCount: Int
}
type OrganizationInviteEdge {
  cursor: String!
  node: OrganizationInvite
}
extend type Query {
  invites(first: Int, last: Int, after: String, before: String, organizationId: ID!): OrganizationInviteConnection @authField @cost(multipliers: ["first", "last"], complexity: 1)
  invite(id: ID!): OrganizationInvite @authField
  validateInvite(id: ID!, token: String!): OrganizationInvite
}

extend type Mutation {
  createInvite(email: String!, organizationId: ID!): OrganizationInvite @authField
  deleteInvite(id: ID!): Boolean @authField
  resendInvite(id: ID!): OrganizationInvite @authField
  acceptInvite(id: ID! token: String!, password: String, name: String): User
}
`;

const resolvers = {
  Query: {
    invite: async (object, { id }, context, info) => {
      const { user } = context.req;
      const invite = await getModelLoader(context, OrganizationInvite).load(id);
      if (await invite.canRead(user)) {
        return invite;
      }
      return null;
    },
    invites: async (object, { organizationId, ...args }, context, info) => {
      const { user } = context.req;
      const query = OrganizationInvite.authorizationFilter(user).where(
        'organizationId',
        organizationId,
      );

      return paginateQuery(context, query, {
        ...args,
        orderByPrefix: 'organizationInvite',
      });
    },
    validateInvite: async (object, { id, token }, context, info) =>
      validateInviteFromToken(id, token),
  },
  OrganizationInvite: {
    fromMember: (invite, args, context, info) =>
      getModelLoader(context, OrganizationMember).load(invite.fromId),
    organization: (invite, args, context, info) =>
      getModelLoader(context, Organization).load(invite.organizationId),
  },
  Mutation: {
    createInvite: async (object, { email, organizationId }, context, info) => {
      const { user } = context.req;
      const member = await OrganizationMember.query()
        .where('userId', user.id)
        .andWhere('organizationId', organizationId)
        .first();

      if (!member) {
        throw new Error(
          'This organization does not exist or you are not part of it.',
        );
      }

      let invite = OrganizationInvite.fromJson({
        email,
        organizationId,
        fromId: member.id,
        token: generateToken(user),
      });

      if (!(await invite.canCreate(user))) {
        throw new Error('Only organization admins can invite users.');
      }

      if (!validateEmail(email)) {
        throw new Error(`${email} is not a valid email.`);
      }

      const existingUser = await User.query()
        .where('email', email)
        .eager('organizations')
        .first();

      if (existingUser) {
        const existsInOrganization = existingUser.organizations
          .map(org => org.id)
          .includes(organizationId);

        if (existsInOrganization) {
          throw new Error(
            'This email address belongs to a user already in this organization.',
          );
        }
      }

      const existingInvite = await OrganizationInvite.query()
        .where('email', email)
        .andWhere('organizationId', organizationId)
        .first();

      if (existingInvite) {
        throw new Error(
          'An invite has already been sent to this email address for this organization.',
        );
      }

      invite = await invite.$query().insertAndFetch();

      await sendInviteEmail(invite);

      return invite;
    },
    deleteInvite: async (object, { id }, context, info) => {
      const { user } = context.req;
      const invite = await OrganizationInvite.authorizationFilter(
        user,
      ).findById(id);

      if (!invite) {
        throw new Error(
          'Invite does not exist or you do not have permission to delete it.',
        );
      }

      if (invite.accepted) {
        throw new Error('You cannot delete an invite that has been accepted.');
      }

      if (!(await invite.canDelete(user))) {
        throw new Error('You do not have permission to delete this invite.');
      }

      await invite.$query().delete();
      return true;
    },
    resendInvite: async (object, { id }, context, info) => {
      const { user } = context.req;
      const invite = await OrganizationInvite.authorizationFilter(
        user,
      ).findById(id);

      if (!invite) {
        throw new Error(
          'Invite does not exist or you do not have permission to access it.',
        );
      }

      if (invite.accepted) {
        throw new Error('You cannot resend an invite that has been accepted.');
      }

      if (!(await invite.canCreate(user))) {
        throw new Error('You do not have permission to resend this invite.');
      }

      await sendInviteEmail(invite);

      return invite.$query().updateAndFetch({
        email: invite.email,
      });
    },
    acceptInvite: async (
      object,
      { id, token, name, password },
      context,
      info,
    ) => {
      let trx;
      try {
        trx = await transaction.start(User.knex());

        const invite = await validateInviteFromToken(id, token);

        let user = await User.query(trx)
          .where('email', invite.email)
          .eager('organizations')
          .first();

        if (user) {
          if (!user.active) {
            throw new Error('Account is inactive.');
          }
          await addUserToOrganization(trx, user, invite.organizationId);
        } else {
          if (!name || name.trim() === '') {
            throw new Error('Name is required.');
          }
          if (!password || password.trim() === '') {
            throw new Error('Password is required.');
          }
          user = await createUser(
            trx,
            { email: invite.email, password, name, active: true },
            { organizationId: invite.organizationId, sendEmail: false },
          );
          user.$relatedQuery('organizations');
          await new Promise((resolve, reject) => {
            context.req.login(user, async error => {
              console.log(error);
              if (error) {
                reject();
              } else {
                resolve();
              }
            });
          });
        }

        await invite.$query(trx).update({
          accepted: true,
        });
        await trx.commit();
        return user;
      } catch (err) {
        await trx.rollback();
        throw err;
      }
    },
  },
};

const validateInviteFromToken = async (id, token) => {
  const invite = await OrganizationInvite.query()
    .where('token', token)
    .andWhere('id', id)
    .first();

  if (!invite || invite.accepted !== null) {
    throw new Error(
      'This invite has either been accepted or is no longer valid.',
    );
  }

  const sender = await OrganizationMember.query()
    .eager('user.organizations')
    .findById(invite.fromId);

  if (!sender) {
    throw new Error('This invite is no longer valid.');
  }

  const existsInOrganization = sender.user.organizations
    .map(org => org.id)
    .includes(invite.organizationId);
  if (!existsInOrganization) {
    throw new Error('This invite is no longer valid.');
  }
  return invite;
};

module.exports = {
  typeDefs,
  resolvers,
};
