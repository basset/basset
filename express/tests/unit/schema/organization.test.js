const runQuery = require('./run-query');

const { createUser } = require('../../utils/user');
const {
  createOrganization,
  addUserToOrganization,
} = require('../../utils/organization');
const Organization = require('../../../app/models/Organization');
const OrganizationMember = require('../../../app/models/OrganizationMember');

describe('organization schema', () => {
  describe('query', async () => {
    let user, organization, otherUser, otherOrganization;
    beforeAll(async () => {
      user = await createUser('user@organization.io');
      organization = await createOrganization('test');
      await addUserToOrganization(organization.id, user.id);
      otherUser = await createUser('test2@notorganization.io');
      otherOrganization = await createOrganization('test2');
      addUserToOrganization(otherOrganization.id, otherUser.id);
    });
    afterAll(async () => {
      await user.$query().delete();
      await organization.$query().delete();
      await otherUser.$query().delete();
      await otherOrganization.$query().delete();
    });
    test('can get organizations you belong to', async () => {
      const query = `
        query organizations($first: Int!) {
          organizations(first: $first) {
            edges {
              node {
                id
              }
            }
          }
        }
      `;
      const variables = {
        first: 100,
      };
      const result = await runQuery(query, user, variables);
      expect(result.data.organizations.edges.length).toBe(1);
      expect(result.data.organizations.edges[0].node.id).toBe(organization.id);
    });

    test('get organization', async () => {
      const query = `
        query organization($id: ID!) {
          organization(id: $id) {
            id
          }
        }
      `;
      const variables = {
        id: organization.id,
      };

      const result = await runQuery(query, user, variables);
      expect(result.errors).toBeUndefined();
      expect(result.data.organization.id).toBe(organization.id);
    });

    test('cannot get organization you do not belong to', async () => {
      const query = `
        query organization($id: ID!) {
          organization(id: $id) {
            id
          }
        }
      `;
      const variables = {
        id: otherOrganization.id,
      };

      const result = await runQuery(query, user, variables);
      expect(result.data.organization).toBe(null);
    });
  });

  describe('mutation', async () => {
    describe('create organization', async () => {
      let user, query;
      beforeAll(async () => {
        user = await createUser('user@organization.io');
        query = `
          mutation createOrganization($name: String!) {
            createOrganization(name: $name) {
              id
            }
          }
        `;
      });
      afterAll(async () => {
        await user.$query().delete();
      });
      test('can create', async () => {
        const variables = {
          name: 'thisisatest',
        };
        const result = await runQuery(query, user, variables);
        const id = result.data.createOrganization.id;
        expect(id).toBeDefined();
        await Organization.query()
          .findById(id)
          .delete();
      });
    });

    describe('editOrganization', async () => {
      let user, organization, otherUser, otherOrganization, query;
      beforeAll(async () => {
        user = await createUser('user@organization.io');
        organization = await createOrganization('test');
        await addUserToOrganization(organization.id, user.id, true);
        otherUser = await createUser('test2@notorganization.io');
        otherOrganization = await createOrganization('test2');
        addUserToOrganization(otherOrganization.id, otherUser.id);
        query = `
          mutation editOrganization($id: ID!, $name: String!) {
            editOrganization(id: $id, name: $name) {
              id
              name
            }
          }
        `;
      });
      afterAll(async () => {
        await user.$query().delete();
        await organization.$query().delete();
        await otherUser.$query().delete();
        await otherOrganization.$query().delete();
      });
      test('admins can edit organizations', async () => {
        const variables = {
          id: organization.id,
          name: 'changed',
        };
        const result = await runQuery(query, user, variables);
        expect(result.data.editOrganization.id).toBe(organization.id);
        expect(result.data.editOrganization.name).toBe('changed');
      });
      test('non admins cannot edit organization', async () => {
        const variables = {
          id: otherOrganization.id,
          name: 'changed',
        };
        const result = await runQuery(query, otherUser, variables);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].message).toBe(
          'You do not have permission to edit this organization.',
        );
      });
      test('cannot edit organization you are not part of', async () => {
        const variables = {
          id: otherOrganization.id,
          name: 'changed',
        };
        const result = await runQuery(query, user, variables);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].message).toBe(
          'Organization does not exist or you do not have permission to edit it.',
        );
      });
    });

    describe('deleteOrganization', async () => {
      let user, organization, otherUser, otherOrganization, query;
      beforeAll(async () => {
        user = await createUser('user@organization.io');
        organization = await createOrganization('test');
        await addUserToOrganization(organization.id, user.id, true);
        otherUser = await createUser('test2@notorganization.io');
        otherOrganization = await createOrganization('test2');
        addUserToOrganization(otherOrganization.id, otherUser.id);
        query = `
          mutation deleteOrganization($id: ID!) {
            deleteOrganization(id: $id)
          }
        `;
      });
      afterAll(async () => {
        await user.$query().delete();
        await organization.$query().delete();
        await otherUser.$query().delete();
        await otherOrganization.$query().delete();
      });
      test('admins can delete organizations', async () => {
        const variables = {
          id: organization.id,
        };
        const result = await runQuery(query, user, variables);
        expect(result.data.deleteOrganization).toBe(true);
      });
      test('non admins cannot delete organization', async () => {
        const variables = {
          id: otherOrganization.id,
        };
        const result = await runQuery(query, otherUser, variables);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].message).toBe(
          'You do not have permission to delete this organization.',
        );
      });
      test('cannot delete organization you are not part of', async () => {
        const variables = {
          id: otherOrganization.id,
        };
        const result = await runQuery(query, user, variables);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].message).toBe(
          'Organization does not exist or you do not have permission to delete it.',
        );
      });
    });
    /*
    describe('removeFromOrganization', async () => {
      let user,
        organization,
        otherUser,
        otherOrganization,
        query,
        member,
        otherMember;
      beforeAll(async () => {
        user = await createUser('user@organization.io');
        removeUser = await createUser('user2@organization.io');
        organization = await createOrganization('test');
        await addUserToOrganization(organization.id, user.id, true);
        member = await addUserToOrganization(organization.id, removeUser.id);
        otherUser = await createUser('test2@notorganization.io');
        removeOtherUser = await createUser('test@notorganization.io');
        otherOrganization = await createOrganization('test2');
        await addUserToOrganization(otherOrganization.id, otherUser.id);
        otherMember = await addUserToOrganization(
          otherOrganization.id,
          removeOtherUser.id,
        );
        query = `
          mutation removeFromOrganization($id: ID!, $organizationMemberId: ID!) {
            removeFromOrganization(id: $id, organizationMemberId: $organizationMemberId)
          }
        `;
      });
      afterAll(async () => {
        await user.$query().delete();
        await removeUser.$query().delete();
        await organization.$query().delete();
        await otherUser.$query().delete();
        await removeOtherUser.$query().delete();
        await otherOrganization.$query().delete();
      });
      test('admins can remove users from organizations', async () => {
        const variables = {
          id: organization.id,
          organizationMemberId: member.id,
        };
        const result = await runQuery(query, user, variables);
        expect(result.data.removeFromOrganization).toBe(true);
      });
      test('non admins cannot remove users from organizations', async () => {
        const variables = {
          id: otherOrganization.id,
          organizationMemberId: otherMember.id,
        };
        const result = await runQuery(query, otherUser, variables);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].message).toBe(
          'You do not have permission to remove users from this organzation.',
        );
      });
      test('cannot remove a users from organization you are not part of', async () => {
        const variables = {
          id: otherOrganization.id,
          organizationMemberId: otherMember.id,
        };
        const result = await runQuery(query, user, variables);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].message).toBe(
          'Organization does not exist or you do not have permission to edit it.',
        );
      });
      test('cannot remove a user who is not part of an organization', async () => {
        const variables = {
          id: organization.id,
          organizationMemberId: member.id,
        };
        const result = await runQuery(query, user, variables);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].message).toBe(
          'Organization does not exist or you do not have permission to edit it.',
        );
      });
    }); */
  });
});
