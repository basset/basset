const crypto = require('crypto');

const Project = require('../../../app/models/Project');

const { createAsset } = require('../../utils/asset');
const { createProject } = require('../../utils/project');
const {
  createOrganization,
  addUserToOrganization,
} = require('../../utils/organization');
const { createUser } = require('../../utils/user');

describe('Project', () => {
  let user, otherUser;
  let organization, otherOrganization;
  let project, otherProject;
  let assets;

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
      await createAsset(project, undefined, {
        location: '/1',
      }),
      await createAsset(project, undefined, {
        location: '/2',
      }),
      await createAsset(project, undefined, {
        location: '/3',
      }),
      await createAsset(project, undefined, {
        location: '/4',
      }),
      await createAsset(project, undefined, {
        location: '/5',
      }),
    ];
  });

  test('key is created', () => {
    expect(project.key).toBeDefined();
    expect(otherProject.key).toBeDefined();
  });

  test('allowedBrowsers', () => {
    expect(Project.allowedBrowsers).toEqual(['firefox', 'chrome']);
  });

  test.each([['canRead', 'canEdit', 'canDelete', 'canCreate']])(
    '%s',
    async prop => {
      expect(await project[prop](user)).toBe(true);
      expect(await project[prop](otherUser)).toBe(false);
      expect(await otherProject[prop](otherUser)).toBe(true);
      expect(await otherProject[prop](user)).toBe(false);
    },
  );

  test('hasSlack', async () => {
    expect(project.hasSlack).toBe(false);
    project.slackWebhook = 'test';
    expect(project.hasSlack).toBe(false);
    project.slackActive = true;
    expect(project.hasSlack).toBe(true);
    project.slackWebhook = '';
    expect(project.hasSlack).toBe(false);
    project.slackWebhook = '  ';
    expect(project.hasSlack).toBe(false);
  });

  test('hasSCM', async () => {
    expect(project.hasSCM).toBe(false);
    project.scmProvider = 'provider';
    expect(project.hasSCM).toBe(false);
    project.scmActive = true;
    expect(project.hasSCM).toBe(false);
    project.scmConfig = JSON.stringify({ repoName: 'yes', repoToken: 'ok' });
    expect(project.hasSCM).toBe(true);
    project.scmProvider = ' ';
    expect(project.hasSCM).toBe(false);
  });

  test('hasToken', async () => {
    expect(project.hasToken).toBe(false);
    project.scmToken = 'test';
    expect(project.hasToken).toBe(true);
    project.scmToken = '';
    expect(project.hasToken).toBe(false);
    project.scmToken = '  ';
    expect(project.hasToken).toBe(false);
  });

  test('getMissingAssets', async () => {
    const existingAssets = assets.reduce((result, item) => {
      result[item.relativePath] = item.sha;
      return result;
    }, {});
    const newAssets = {
      'path/to/new-asset.png': crypto.randomBytes(20).toString('hex'),
      'path/to/new-asset2.png': crypto.randomBytes(20).toString('hex'),
    };
    const missing = await project.getMissingAssets({
      ...newAssets,
      ...existingAssets,
    });
    expect(missing).toEqual(newAssets);
  });

  test('getMissingAssets ignores duplicate shas', async () => {
    const sha = crypto.randomBytes(20).toString('hex');
    const newAssets = {
      'path/to/randomfile.png': sha,
      'path/to/samefile.png': sha,
    };
    const missingAssets = await project.getMissingAssets(newAssets);
    expect(Object.keys(missingAssets)).toHaveLength(1);
  });

  test('createAssets', async () => {
    const path = 'path/to/new-asset.png';
    const path2 = 'path/to/new-asset2.png';
    const newAssets = {
      [path]: '1234ab',
      [path2]: '1234bc',
    };
    await project.createAssets(newAssets);
    const updatedAssets = await project.$relatedQuery('assets');
    expect(updatedAssets).toHaveLength(assets.length + 2);
    const newAsset = updatedAssets.find(a => a.sha === newAssets[path]);
    expect(newAsset.sha).toBe(newAssets[path]);
    expect(updatedAssets).toHaveLength(assets.length + 2);
    const newAsset2 = updatedAssets.find(a => a.sha === newAssets[path2]);
    expect(newAsset2.sha).toBe(newAssets[path2]);
  });

  test('createAssets creates an asset that exists in another project', async () => {
    await createAsset(project, '12345ea');
    const newAssets = {
      'path/to/asset.png': '12345ea',
    };
    await otherProject.createAssets(newAssets);
    const asset = await otherProject
      .$relatedQuery('assets')
      .where('sha', '12345ea')
      .first();
    expect(asset).toBeDefined();
  });

  test('createAssets does not create duplicates', async () => {
    const path = 'path/to/new-asset.png';
    const path2 = 'path/to/new-asset2.png';
    const newAssets = {
      [path]: '1234ab',
      [path2]: '1234bc',
    };
    await project.createAssets(newAssets);
    const updatedAssets = await project.$relatedQuery('assets');
    expect(updatedAssets).toHaveLength(assets.length + 3);
  });
});
