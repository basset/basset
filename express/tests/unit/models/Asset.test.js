const Asset = require('../../../app/models/Asset');

const { createAsset } = require('../../utils/asset');
const { createProject } = require('../../utils/project');
const {
  createOrganization,
  addUserToOrganization,
} = require('../../utils/organization');
const { createUser } = require('../../utils/user');

describe('Asset', () => {
  let user, otherUser;
  let organization, otherOrganization;
  let project, otherProject;
  let assets, otherAssets;

  beforeAll(async () => {
    user = await createUser('snapshot@snapshotmodel.io');
    organization = await createOrganization('snapshotmodel');
    await addUserToOrganization(organization.id, user.id, true);
    user = await user.$query().eager('organizations');

    otherUser = await createUser('snapshot@snapshotmodel2.io');
    otherOrganization = await createOrganization('snapshotmodel2');
    addUserToOrganization(otherOrganization.id, otherUser.id, true);
    otherUser = await otherUser.$query().eager('organizations');

    project = await createProject('test', organization.id);
    otherProject = await createProject('test', otherOrganization.id);

    assets = [
      await createAsset(project),
      await createAsset(project),
      await createAsset(project),
      await createAsset(project),
      await createAsset(project),
    ];

    otherAssets = [
      await createAsset(otherProject),
      await createAsset(otherProject),
      await createAsset(otherProject),
      await createAsset(otherProject),
      await createAsset(otherProject),
    ];
  });
  test('canRead', async () => {
    expect(await assets[0].canRead(user)).toBe(true);
    expect(await assets[0].canRead(otherUser)).toBe(false);
    expect(await otherAssets[0].canRead(otherUser)).toBe(true);
    expect(await otherAssets[0].canRead(user)).toBe(false);
  });
  test('authorizationFilter', async () => {
    const userAssets = await Asset.authorizationFilter(user);
    expect(userAssets).toHaveLength(5);
    expect(userAssets).toEqual(expect.arrayContaining(assets));
    const otherUserAssets = await Asset.authorizationFilter(otherUser);
    expect(otherUserAssets).toHaveLength(5);
    expect(otherUserAssets).toEqual(expect.arrayContaining(otherAssets));
  });
  test('create', async () => {
    const newAsset = await Asset.create({
      location: '',
      projectId: project.id,
      organizationId: project.organizationId,
    });
    expect(newAsset.id).toBeDefined();
  });
});
