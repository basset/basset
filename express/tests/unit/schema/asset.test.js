const runQuery = require('./run-query');

const { createUser } = require('../../utils/user');
const {
  createOrganization,
  addUserToOrganization,
} = require('../../utils/organization');
const { createProject } = require('../../utils/project');
const { createAsset } = require('../../utils/asset');

describe('asset schema', () => {
  let user, otherUser;
  let organization, otherOrganization;
  let project, project2, otherProject;
  let asset, asset2, otherAsset;

  beforeAll(async () => {
    user = await createUser('asset@organization.io');
    organization = await createOrganization('test');
    await addUserToOrganization(organization.id, user.id);
    otherUser = await createUser('asset@notorganization.io');
    otherOrganization = await createOrganization('test2');
    addUserToOrganization(otherOrganization.id, otherUser.id, true);
    project = await createProject('test', organization.id);
    project2 = await createProject('test', organization.id);
    otherProject = await createProject('test', otherOrganization.id);
    asset = await createAsset(project);
    asset2 = await createAsset(project2);
    otherAsset = await createAsset(otherProject);
  });
  afterAll(async () => {
    await user.$query().delete();
    await organization.$query().delete();
    await otherUser.$query().delete();
    await otherOrganization.$query().delete();
  });
  describe('query', async () => {
    test('can get assets within your organization', async () => {
      const query = `
        query assets($first: Int!, $organizationId: ID!, $projectId: ID) {
          assets(first: $first, organizationId: $organizationId, projectId: $projectId) {
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
      expect(result.data.assets.edges.length).toBe(2);
      expect(result.data.assets.edges[0].node.id).toBe(asset.id);
      expect(result.data.assets.edges[1].node.id).toBe(asset2.id);
    });

    test('can get assets within your organization by project', async () => {
      const query = `
        query assets($first: Int!, $organizationId: ID!, $projectId: ID) {
          assets(first: $first, organizationId: $organizationId, projectId: $projectId) {
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
      expect(result.data.assets.edges.length).toBe(1);
      expect(result.data.assets.edges[0].node.id).toBe(asset2.id);
    });

    test('get asset', async () => {
      const query = `
        query asset($assetId: ID!) {
          asset(id: $assetId) {
            id
          }
        }
      `;
      const variables = {
        first: 100,
        assetId: asset.id,
      };

      const result = await runQuery(query, user, variables);
      expect(result.errors).toBeUndefined();
      expect(result.data.asset.id).toBe(asset.id);
    });

    test('cannot get project your organization does not own', async () => {
      const query = `
        query asset($assetId: ID!) {
          asset(id: $assetId) {
            id
          }
        }
      `;
      const variables = {
        first: 100,
        assetId: otherAsset.id,
      };

      const result = await runQuery(query, user, variables);
      expect(result.data.asset).toBe(null);
    });
  });
});
