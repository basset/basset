const runQuery = require('./run-query');

const { createUser } = require('../../utils/user');
const {
  createOrganization,
  addUserToOrganization,
} = require('../../utils/organization');
const { createProject } = require('../../utils/project');

describe('project schema', () => {
  let user, organization, otherUser, otherOrganization, project, otherProject;
  beforeAll(async () => {
    user = await createUser('project@organization.io');
    organization = await createOrganization('test');
    await addUserToOrganization(organization.id, user.id);
    otherUser = await createUser('project@notorganization.io');
    otherOrganization = await createOrganization('test2');
    addUserToOrganization(otherOrganization.id, otherUser.id, true);
    project = await createProject('test', organization.id);
    otherProject = await createProject('test', otherOrganization.id);
  });
  afterAll(async () => {
    await user.$query().delete();
    await organization.$query().delete();
    await otherUser.$query().delete();
    await otherOrganization.$query().delete();
  });
  describe('query', async () => {
    test('can get projects within your organization', async () => {
      const query = `
        query projects($first: Int!, $organizationId: ID!) {
          projects(first: $first, organizationId: $organizationId) {
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
      expect(result.data.projects.edges.length).toBe(1);
      expect(result.data.projects.edges[0].node.id).toBe(project.id);
    });

    test('get project', async () => {
      const query = `
        query project($projectId: ID!) {
          project(id: $projectId) {
            id
          }
        }
      `;
      const variables = {
        projectId: project.id,
      };

      const result = await runQuery(query, user, variables);
      expect(result.errors).toBeUndefined();
      expect(result.data.project.id).toBe(project.id);
    });

    test('cannot get project your organization does not own', async () => {
      const query = `
        query project($projectId: ID!) {
          project(id: $projectId) {
            id
          }
        }
      `;
      const variables = {
        projectId: otherProject.id,
      };

      const result = await runQuery(query, user, variables);
      expect(result.data.project).toBe(null);
    });
  });

  describe('mutation', async () => {
    describe('createProject', () => {
      const query = `
      mutation createProject($name: String!, $organizationId: ID!) {
        createProject(name: $name, organizationId: $organizationId) {
          id
          name
        }
      }
      `;

      test('admins can create a project', async () => {
        const variables = {
          organizationId: otherOrganization.id,
          name: 'haha',
        };

        const result = await runQuery(query, otherUser, variables);
        expect(result.data.createProject.id).toBeDefined();
        expect(result.data.createProject.name).toBe('haha');
      });

      test('non admins cannot create a project', async () => {
        const variables = {
          organizationId: organization.id,
          name: 'haha',
        };

        const result = await runQuery(query, user, variables);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].message).toBe(
          'You do not have permission to create projects.',
        );
      });
      test('cannot create project in another organization', async () => {
        const variables = {
          organizationId: organization.id,
          name: 'haha',
        };

        const result = await runQuery(query, otherUser, variables);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].message).toBe(
          'Organization does not exist or you do not have permission to create projects.',
        );
      });
    });

    describe('editProject', () => {
      const query = `
      mutation editProject($id: ID!, $projectInput: ProjectInput!) {
        editProject(id: $id, projectInput: $projectInput) {
          id
          name
          key
          hasToken
          provider
          scmConfig {
            repoOwner
            repoName
          }
          scmActive
          defaultBranch
          defaultWidth
          browsers
          slackWebhook
          slackActive
          slackVariable
        }
      }
      `;

      test('admins can edit a project', async () => {
        const variables = {
          id: otherProject.id,
          projectInput: {
            name: 'test',
            scmActive: true,
            scmConfig: {
              repoOwner: 'tester',
              repoName: 'testerName',
            },
            defaultBranch: 'branch',
            slackWebhook: 'hook',
            slackActive: true,
            slackVariable: 'var',
          },
        };

        const result = await runQuery(query, otherUser, variables);
        expect(result.data.editProject).toEqual(
          expect.objectContaining(variables.projectInput),
        );
      });

      test('non admins cannot edit a project', async () => {
        const variables = {
          id: project.id,
          projectInput: {
            name: 'test',
          },
        };

        const result = await runQuery(query, user, variables);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].message).toBe(
          'You do not have permission to edit projects.',
        );
      });
      test('cannot edit project in another organization', async () => {
        const variables = {
          id: project.id,
          projectInput: {
            name: 'test',
          },
        };

        const result = await runQuery(query, otherUser, variables);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].message).toBe(
          'Project does not exist or you do not have permission to edit projects.',
        );
      });
    });

    describe('deleteProject', () => {
      const query = `
      mutation deleteProject($id: ID!) {
        deleteProject(id: $id)
      }
      `;

      test('admins can delete a project', async () => {
        const variables = {
          id: otherProject.id,
        };

        const result = await runQuery(query, otherUser, variables);
        expect(result.data.deleteProject).toBe(true);
      });

      test('non admins cannot delete a project', async () => {
        const variables = {
          id: project.id,
        };

        const result = await runQuery(query, user, variables);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].message).toBe(
          'You do not have permission to delete projects.',
        );
      });
      test('cannot delete project in another organization', async () => {
        const variables = {
          id: project.id,
        };

        const result = await runQuery(query, otherUser, variables);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].message).toBe(
          'Project does not exist or you do not have permission to delete projects.',
        );
      });
    });
  });
});
