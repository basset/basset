const runQuery = require('./run-query');

const { createUser } = require('../../utils/user');
const {
  createOrganization,
  addUserToOrganization,
} = require('../../utils/organization');
const { createProject } = require('../../utils/project');
const { createBuild } = require('../../utils/build');

describe('build schema', () => {
  let user, otherUser;
  let organization, otherOrganization;
  let project, project2, otherProject;
  let build, build2, otherBuild;

  beforeAll(async () => {
    user = await createUser('build@organization.io');
    organization = await createOrganization('test');
    await addUserToOrganization(organization.id, user.id);
    otherUser = await createUser('build@notorganization.io');
    otherOrganization = await createOrganization('test2');
    addUserToOrganization(otherOrganization.id, otherUser.id, true);
    project = await createProject('test', organization.id);
    project2 = await createProject('test', organization.id);
    otherProject = await createProject('test', otherOrganization.id);
    build = await createBuild('test', project);
    build2 = await createBuild('test', project2);
    otherBuild = await createBuild('test', otherProject);
  });
  afterAll(async () => {
    await user.$query().delete();
    await organization.$query().delete();
    await otherUser.$query().delete();
    await otherOrganization.$query().delete();
  });
  describe('query', async () => {
    test('can get builds within your organization', async () => {
      const query = `
        query builds($first: Int!, $organizationId: ID!, $projectId: ID) {
          builds(first: $first, organizationId: $organizationId, projectId: $projectId) {
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
        organizationId: organization.id,
      };
      const result = await runQuery(query, user, variables);
      expect(result.data.builds.edges.length).toBe(2);
      expect(result.data.builds.edges[0].node.id).toBe(build.id);
      expect(result.data.builds.edges[1].node.id).toBe(build2.id);
    });

    test('can get builds within your organization by project', async () => {
      const query = `
        query builds($first: Int!, $organizationId: ID!, $projectId: ID) {
          builds(first: $first, organizationId: $organizationId, projectId: $projectId) {
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
        organizationId: organization.id,
        projectId: project2.id,
      };
      const result = await runQuery(query, user, variables);
      expect(result.data.builds.edges.length).toBe(1);
      expect(result.data.builds.edges[0].node.id).toBe(build2.id);
    });

    test('get build', async () => {
      const query = `
        query build($buildId: ID!) {
          build(id: $buildId) {
            id
          }
        }
      `;
      const variables = {
        buildId: build.id,
      };

      const result = await runQuery(query, user, variables);
      expect(result.errors).toBeUndefined();
      expect(result.data.build.id).toBe(build.id);
    });

    test('cannot get build your organization does not own', async () => {
      const query = `
        query build($buildId: ID!) {
          build(id: $buildId) {
            id
          }
        }
      `;
      const variables = {
        buildId: otherBuild.id,
      };

      const result = await runQuery(query, user, variables);
      expect(result.data.build).toBe(null);
    });
  });

  describe('mutation', async () => {
    describe('cancelBuild', () => {
      const query = `
      mutation cancelBuild($id: ID!) {
        cancelBuild(id: $id) {
          cancelledAt
        }
      }
      `;

      test('admins can cancel a project', async () => {
        const variables = {
          id: otherBuild.id,
        };

        const result = await runQuery(query, otherUser, variables);
        expect(result.data.cancelBuild.cancelledAt).toBeDefined();
      });

      test('non admins can cancel a project', async () => {
        const variables = {
          id: build.id,
        };

        const result = await runQuery(query, user, variables);
        expect(result.data.cancelBuild.cancelledAt).toBeDefined();
      });

      test('cannot edit project in another organization', async () => {
        const variables = {
          id: build.id,
        };

        const result = await runQuery(query, otherUser, variables);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].message).toBe(
          'Build does not exist or you do not have permission to modify builds.',
        );
      });

      test('cannot cancel an already cancelled build', async () => {
        const variables = {
          id: otherBuild.id,
        };

        const result = await runQuery(query, otherUser, variables);
        expect(result.errors[0].message).toBe('Build has already cancelled.');
      });
    });
  });
});
