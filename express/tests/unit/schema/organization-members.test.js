const runQuery = require('./run-query');
const { createUser } = require('../../utils/user');
const {
  createOrganization,
  addUserToOrganization,
} = require('../../utils/organization');

describe('member schema', async () => {
  describe('query members', async () => {
    let user,
      user2,
      user3,
      organization,
      organization2,
      query,
      queries,
      member,
      member2,
      member3;
    beforeAll(async () => {
      queries = `
        query organizationMembers($first: Int!, $organizationId: ID!) {
          organizationMembers(first: $first, organizationId: $organizationId) {
            edges {
              node {
                id
                user {
                  id
                }
              }
            }
          }
        }
      `;
      query = `
      query organizationMember($id: ID!) {
        organizationMember(id: $id) {
          id
          user {
            id
          }
        }
      }
      `;
      user = await createUser('admin@basset.io');
      user2 = await createUser('profile@basset.io');
      organization = await createOrganization('basset.io');
      member = await addUserToOrganization(organization.id, user.id);
      member2 = await addUserToOrganization(organization.id, user2.id);
      organization2 = await createOrganization('bassettest.io');
      user3 = await createUser('profile2@bassettest.io');
      member3 = await addUserToOrganization(organization2.id, user3.id);
    });
    afterAll(async () => {
      await user.$query().delete();
      await user2.$query().delete();
      await user3.$query().delete();
      await organization.$query().delete();
      await organization2.$query().delete();
    });

    test('can retrieve organizationMembers', async () => {
      const variables = {
        first: 100,
        organizationId: organization.id,
      };
      const result = await runQuery(queries, user, variables);
      expect(result.errors).toBeUndefined();
      expect(result.data.organizationMembers.edges).toHaveLength(2);
      expect(result.data.organizationMembers.edges[0].node.user.id).toEqual(
        user.id,
      );
      expect(result.data.organizationMembers.edges[1].node.user.id).toEqual(
        user2.id,
      );
    });

    test('cannot retrieve organizationMembers not in your organization', async () => {
      const variables = {
        first: 100,
        organizationId: organization2.id,
      };
      const result = await runQuery(queries, user, variables);
      expect(result.data.organizationMembers.edges).toHaveLength(0);
    });

    test('can retrieve organizationMember by id', async () => {
      const variables = {
        id: member.id,
      };
      const result = await runQuery(query, user, variables);
      expect(result.data.organizationMember.id).toEqual(member.id);
    });

    test('cannot retrieve profile not in organization', async () => {
      const variables = {
        id: member3.id,
      };
      const result = await runQuery(query, user, variables);
      expect(result.data.organizationMember).toEqual(null);
    });
  });
  describe('mutations', () => {});
});
