const runQuery = require('./run-query');
const { createUser } = require('../../utils/user');
const {
  createOrganization,
  addUserToOrganization,
} = require('../../utils/organization');
const { createInvite } = require('../../utils/invite');
const OrganizationInvite = require('../../../app/models/OrganizationInvite');
const User = require('../../../app/models/User');

jest.mock('../../../app/utils/email', () => ({
  sendActivationEmail: jest.fn(),
  sendWelcomeEmail: jest.fn(),
  sendInviteEmail: jest.fn(),
}));

describe('invite schema', async () => {
  describe('query invites', async () => {
    let member, user, organization, query;
    let member2, user2, organization2, query2;
    beforeAll(async () => {
      query = `
        query invites($first: Int!, $organizationId: ID!) {
          invites(first: $first, organizationId: $organizationId) {
            edges {
              node {
                id
                fromMember {
                  id
                }
              }
            }
          }
        }
      `;
      query2 = `
        query invite($id: ID!) {
          invite(id: $id) {
            id
            fromMember {
              id
            }
          }
        }
      `;
      user = await createUser('admin@invite.io');
      user2 = await createUser('admin2@invite.io');
      organization = await createOrganization('invite.io');
      organization2 = await createOrganization('invite.io');
      member = await addUserToOrganization(organization.id, user.id);
      member2 = await addUserToOrganization(organization2.id, user2.id, true);
      invite = await createInvite('test@invite.com', member, organization.id);
      invite2 = await createInvite(
        'test2@invite.com',
        member2,
        organization2.id,
      );
    });
    afterAll(async () => {
      await user.$query().delete();
      await user2.$query().delete();
      await organization.$query().delete();
      await organization2.$query().delete();
      await invite.$query().delete();
      await invite2.$query().delete();
    });

    test('can retrieve invites', async () => {
      const variables = {
        first: 100,
        organizationId: organization.id,
      };
      const result = await runQuery(query, user, variables);
      expect(result.data.invites.edges).toHaveLength(1);
      expect(result.data.invites.edges[0].node.id).toEqual(invite.id);
      expect(result.data.invites.edges[0].node.fromMember.id).toEqual(
        member.id,
      );
    });

    test('cannot retrieve invites not in your organization', async () => {
      const variables = {
        first: 100,
        organizationId: organization2.id,
      };
      const result = await runQuery(query, user, variables);
      expect(result.data.invites.edges).toHaveLength(0);
    });

    test('can retrieve invite by id', async () => {
      const variables = {
        id: invite.id,
      };
      const result = await runQuery(query2, user, variables);
      expect(result.data.invite.id).toEqual(invite.id);
      expect(result.data.invite.fromMember.id).toEqual(member.id);
    });

    test('cannot retrieve invite not in organization', async () => {
      const variables = {
        id: invite2.id,
      };
      const result = await runQuery(query2, user, variables);
      expect(result.data.invite).toEqual(null);
    });
  });
  describe('validateInvite query', () => {
    let user, member, organization, query;
    let invite, invite2, acceptedInvite;
    let user2, member2, organization2;
    beforeAll(async () => {
      query = `
          query validateInvite($id: ID!, $token: String!) {
            validateInvite(id: $id, token: $token) {
              id
            }
          }
        `;

      user = await createUser('admin@invite.io');
      user2 = await createUser('admin2@invite.io');
      organization = await createOrganization('invite.io');
      organization2 = await createOrganization('invite.io');
      member = await addUserToOrganization(organization.id, user.id, true);
      member2 = await addUserToOrganization(organization.id, user2.id, true);

      invite = await createInvite('test@invite.com', member, organization.id);
      invite2 = await createInvite(
        'test2@invite.com',
        member2,
        organization2.id,
      );
      acceptedInvite = await createInvite(
        'test3@invite.com',
        member,
        organization.id,
        { accepted: true },
      );
    });
    afterAll(async () => {
      await user.$query().delete();
      await user2.$query().delete();
      await invite.$query().delete();
      await invite2.$query().delete();
      await acceptedInvite.$query().delete();
      await organization.$query().delete();
      await organization2.$query().delete();
    });

    test('can validate invite token', async () => {
      const variables = {
        token: invite.token,
        id: invite.id,
      };
      const result = await runQuery(query, null, variables);
      expect(result.data.validateInvite.id).toBe(invite.id);
    });

    test('cannot validate invite token already used', async () => {
      const variables = {
        token: acceptedInvite.token,
        id: acceptedInvite.id,
      };
      const result = await runQuery(query, null, variables);
      expect(result.errors[0].message).toBe(
        'This invite has either been accepted or is no longer valid.',
      );
    });

    test('cannot validate invite when user is nonger part of organization', async () => {
      const variables = {
        token: invite2.token,
        id: invite2.id,
      };
      const result = await runQuery(query, null, variables);
      expect(result.errors[0].message).toBe('This invite is no longer valid.');
    });
  });

  describe('invite mutation', () => {
    describe('createInvite', () => {
      let member, user, organization, query;
      let member2, user2, organization2;
      beforeAll(async () => {
        query = `
          mutation createInvite($email: String!, $organizationId: ID!) {
            createInvite(email: $email, organizationId: $organizationId) {
              id
              token
              fromMember {
                id
              }
            }
          }
        `;

        user = await createUser('admin@invite.io');
        user2 = await createUser('admin2@invite.io');
        organization = await createOrganization('invite.io');
        organization2 = await createOrganization('invite.io');
        member = await addUserToOrganization(organization.id, user.id, true);
        member2 = await addUserToOrganization(organization2.id, user2.id);
      });
      afterAll(async () => {
        await user.$query().delete();
        await user2.$query().delete();
        await organization.$query().delete();
        await organization2.$query().delete();
      });

      test('can create invite', async () => {
        const variables = {
          organizationId: organization.id,
          email: 'inviteme@invite.io',
        };
        const result = await runQuery(query, user, variables);
        const invite = result.data.createInvite;
        expect(invite.id).toBeDefined();
        expect(invite.fromMember.id).toEqual(member.id);
        await OrganizationInvite.query()
          .findById(invite.id)
          .delete();
      });

      test('only admins can invite', async () => {
        const variables = {
          organizationId: organization2.id,
          email: 'inviteme@invite.io',
        };
        const result = await runQuery(query, user2, variables);
        expect(result.errors[0].message).toBe(
          'Only organization admins can invite users.',
        );
      });

      test('cannot invite users to another network you are not part of', async () => {
        const variables = {
          organizationId: organization2.id,
          email: 'inviteme@invite.io',
        };
        const result = await runQuery(query, user, variables);
        expect(result.errors[0].message).toBe(
          'This organization does not exist or you are not part of it.',
        );
      });

      test('cannot invite someone already invited to same organization', async () => {
        const invite = await createInvite(
          'inviteme@invite.io',
          member,
          organization.id,
        );
        const variables = {
          organizationId: organization.id,
          email: 'inviteme@invite.io',
        };
        const result = await runQuery(query, user, variables);
        expect(result.errors[0].message).toEqual(
          'An invite has already been sent to this email address for this organization.',
        );
        await invite.$query().delete();
      });

      test('cannot invite a user who is already in the organization', async () => {
        const variables = {
          organizationId: organization.id,
          email: 'admin@invite.io',
        };
        const result = await runQuery(query, user, variables);
        expect(result.errors[0].message).toEqual(
          'This email address belongs to a user already in this organization.',
        );
      });
    });

    describe('deleteInvite', () => {
      let member, user, organization, query;
      let member2, user2, organization2;
      beforeAll(async () => {
        query = `
          mutation deleteInvite($id: ID!) {
            deleteInvite(id: $id)
          }
        `;

        user = await createUser('admin@invite.io');
        user2 = await createUser('admin2@invite.io');
        organization = await createOrganization('invite.io');
        organization2 = await createOrganization('invite.io');
        member = await addUserToOrganization(organization.id, user.id, true);
        member2 = await addUserToOrganization(organization2.id, user2.id);
        invite = await createInvite('test@invite.com', member, organization.id);
        invite2 = await createInvite(
          'test2@invite.com',
          member2,
          organization2.id,
        );
      });
      afterAll(async () => {
        await user.$query().delete();
        await user2.$query().delete();
        await invite.$query().delete();
        await invite2.$query().delete();
        await organization.$query().delete();
        await organization2.$query().delete();
      });

      test('can delete invite', async () => {
        const variables = {
          id: invite.id,
        };
        const result = await runQuery(query, user, variables);
        expect(result.data.deleteInvite).toEqual(true);
      });

      test('only admins can delete an invite', async () => {
        const variables = {
          id: invite2.id,
        };
        const result = await runQuery(query, user2, variables);
        expect(result.errors[0].message).toBe(
          'You do not have permission to delete this invite.',
        );
      });

      test('cannot delete an invite thats part of another organization', async () => {
        const variables = {
          id: invite2.id,
        };
        const result = await runQuery(query, user, variables);
        expect(result.errors[0].message).toBe(
          'Invite does not exist or you do not have permission to delete it.',
        );
      });
    });

    describe('acceptInvite', () => {
      let user, member, organization, invite, query;
      beforeAll(async () => {
        query = `
          mutation acceptInvite($id: ID!, $token: String!, $name: String!, $password: String!) {
            acceptInvite(id: $id, token: $token, name: $name, password: $password) {
              id
              email
              name
              active
              organizations(first: 100) {
                edges {
                  node {
                    id
                  }
                }
              }
            }
          }
        `;

        user = await createUser('admin@invite.io');
        organization = await createOrganization('invite.io');
        member = await addUserToOrganization(organization.id, user.id, true);
        invite = await createInvite('test@invite.com', member, organization.id);
        //await addUserToOrganization(organization2.id, user2.profile.id);
      });
      afterAll(async () => {
        //await user.$query().delete();
        //await invite.$query().delete();
        //await organization.$query().delete();
      });

      test('can accept invite', async () => {
        const variables = {
          token: invite.token,
          id: invite.id,
          name: 'tester',
          password: 'tester',
        };
        const req = {
          isAuthenticated: () => false,
          login: jest.fn((u, cb) => cb(null)),
          user: null,
        }
        const result = await runQuery(query, null, variables, {req, });
        expect(result.data.acceptInvite.id).toBeDefined();
        expect(result.data.acceptInvite.email).toBe(invite.email);
        expect(result.data.acceptInvite.name).toBe('tester');
        expect(result.data.acceptInvite.active).toBe(true);
        expect(result.data.acceptInvite.organizations.edges).toHaveLength(1);
        expect(result.data.acceptInvite.organizations.edges[0].node.id).toBe(
          organization.id,
        );
      });
    });
  });
});
