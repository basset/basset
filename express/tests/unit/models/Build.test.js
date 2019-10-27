jest.mock('../../../app/integrations/github/index', () => ({
  snapshotsPending: jest.fn(),
  snapshotsNeedApproving: jest.fn(),
  snapshotsNoDiffs: jest.fn(),
  snapshotsApproved: jest.fn(),
  getBaseSHA: jest.fn(),
}));

let mockGetPRsValue = [];
let mockGetPRValue = {};

jest.mock('../../../app/integrations/slack/slack', () => ({
  notifySnapshotsNeedApproving: jest.fn(),
}));

jest.mock('../../../app/tasks/queueCompareSnapshots', () => ({
  queueCompareSnapshots: jest.fn(),
}));

const github = require('../../../app/integrations/github/index');
const slack = require('../../../app/integrations/slack/slack');
const tasks = require('../../../app/tasks/queueCompareSnapshots');
const Build = require('../../../app/models/Build');
const { createSnapshot } = require('../../utils/snapshot');
const { createBuild } = require('../../utils/build');
const { createProject } = require('../../utils/project');
const {
  createOrganization,
  addUserToOrganization,
} = require('../../utils/organization');
const { createUser } = require('../../utils/user');

describe('Build', () => {
  let user, otherUser;
  let organization, otherOrganization;
  let project, project2, otherProject;
  let build, build2, build3, otherBuild;
  let fakeProject = { hasSCM: true, scmProvider: 'github', get scm() { return github } };

  beforeAll(async () => {
    user = await createUser('snapshot@snapshotmodel.io');
    organization = await createOrganization('snapshotmodel');
    await addUserToOrganization(organization.id, user.id);
    user = await user.$query().eager('organizations');

    otherUser = await createUser('snapshot@snapshotmodel2.io');
    otherOrganization = await createOrganization('snapshotmodel2');
    await addUserToOrganization(otherOrganization.id, otherUser.id, true);
    otherUser = await otherUser.$query().eager('organizations');

    project = await createProject('test', organization.id, {
      defaultBranch: 'basset',
    });
    project2 = await createProject('test', organization.id, {
      scmConfig: JSON.stringify({
        repoName: 'basset',
        repoOwner: 'basset',
      }),
      scmProvider: 'github',
      scmActive: true,
    });
    otherProject = await createProject('test', otherOrganization.id);
    build = await createBuild('test', project);
    build2 = await createBuild('test2', project2);
    otherBuild = await createBuild('test', otherProject);
  });

  test.each([['canRead', 'canEdit']])('%s', async prop => {
    expect(await build[prop](user)).toBe(true);
    expect(await build[prop](otherUser)).toBe(false);
    expect(await otherBuild[prop](otherUser)).toBe(true);
    expect(await otherBuild[prop](user)).toBe(false);
  });

  test('authorizationFilter', async () => {
    const userBuilds = await Build.authorizationFilter(user);
    expect(userBuilds).toHaveLength(2);
    expect(userBuilds).toEqual(expect.arrayContaining([build, build2]));
    const otherUserBuilds = await Build.authorizationFilter(otherUser);
    expect(otherUserBuilds).toHaveLength(1);
    expect(otherUserBuilds).toEqual([otherBuild]);
  });

  test('create', async () => {
    const newBuild = await Build.create({
      branch: 'test',
      projectId: project.id,
      organizationId: project.organizationId,
    });
    expect(newBuild.id).toBeDefined();
    expect(newBuild.number).toBe(2);
  });

  test('notifyPending', async () => {
    await build.notifyPending({ hasSCM: false });
    expect(github.snapshotsPending).not.toHaveBeenCalled();

    await build.notifyPending(fakeProject);
    expect(github.snapshotsPending).toHaveBeenCalledWith(fakeProject, build);
  });

  test('notifyApproved', async () => {
    await build.notifyApproved(null, { hasSCM: false });
    expect(github.snapshotsApproved).not.toHaveBeenCalled();

    await build.notifyApproved(null, fakeProject);
    expect(github.snapshotsApproved).toHaveBeenCalledWith(fakeProject, build);
  });

  test('notifyChanges', async () => {
    await build.notifyChanges(0, { hasSCM: false });
    expect(build.buildVerified).toBe(true);
    expect(github.snapshotsNeedApproving).not.toHaveBeenCalled();

    await build.notifyChanges(0, fakeProject);
    expect(github.snapshotsNeedApproving).toHaveBeenCalledWith(fakeProject, build);
    expect(slack.notifySnapshotsNeedApproving).not.toHaveBeenCalled();
    const p = { ...fakeProject, hasSlack: true };
    await build.notifyChanges(0, p);
    expect(slack.notifySnapshotsNeedApproving).toHaveBeenCalledWith(
      0,
      p,
      build,
    );
  });

  test('notifyNoChanges', async () => {
    await build2.notifyNoChanges(null, { hasSCM: false });
    expect(github.snapshotsNoDiffs).not.toHaveBeenCalled();
    expect(build2.buildVerified).toBe(true);
    await build2.notifyNoChanges(null, fakeProject);
    expect(github.snapshotsNoDiffs).toHaveBeenCalledWith(fakeProject, build2);
  });

  describe('getPreviousBuild', () => {
    it('should return the previous build based on the PR', async () => {
      github.getBaseSHA.mockImplementationOnce(() => Promise.resolve('123ea'));
      const firstBuild = await createBuild('repoBranch', project2, {
        buildVerified: true,
        completedAt: Build.knex().fn.now(),
      });
      const prBuild = await createBuild('repoBranch', project2);
      prBuild.notifyPending = jest.fn();
      expect(await prBuild.getPreviousBuild({ project: project2 })).toEqual(
        firstBuild,
      );
      expect(prBuild.notifyPending).toHaveBeenCalled();
    });

    it('should return the previous build based on a PRs base branch commit SHA1', async () => {
      github.getBaseSHA.mockImplementationOnce(() => Promise.resolve('sha1'));
      const baseBuild = await createBuild('baseBranch', project2, {
        commitSha: 'sha1',
        buildVerified: true,
        completedAt: Build.knex().fn.now(),
      });
      const newBuild = await createBuild('otherBranch', project2);
      expect(await newBuild.getPreviousBuild({ project: project2 })).toEqual(
        baseBuild,
      );
    });

    it('should return the previous build based on the last branch', async () => {
      const baseBuild = await createBuild('diffBranch', project, {
        buildVerified: true,
        completedAt: Build.knex().fn.now(),
      });
      const newBuild = await createBuild('diffBranch', project);
      expect(await newBuild.getPreviousBuild({ project: project })).toEqual(
        baseBuild,
      );
    });

    it('should return the previous build based on a project default branch', async () => {
      const baseBuild = await createBuild('basset', project, {
        buildVerified: true,
        completedAt: Build.knex().fn.now(),
      });
      const newBuild = await createBuild('diffBranch', project);
      expect(await newBuild.getPreviousBuild({ project })).toEqual(baseBuild);
    });

    it('should return undefined if no previous build is found', async () => {
      const newBuild = await createBuild('diffBranch', otherProject);
      const previousBuild = await newBuild.getPreviousBuild();
      expect(previousBuild).toBeUndefined();
    });
  });

  test('compareSnapshots', async () => {
    const previousBuild = await createBuild('brancher', project);
    const previousSnapshots = [
      await createSnapshot('snappy', previousBuild, {
        approved: true,
        width: '1280',
        browser: 'firefox',
      }),
      await createSnapshot('snappy 2', previousBuild, {
        diff: false,
        width: '720',
        browser: 'chrome',
      }),
      await createSnapshot('snappy 3', previousBuild, {
        approved: true,
        width: '360',
        browser: 'chrome',
      }),
      await createSnapshot('snappy 4', previousBuild, {
        diff: true,
        width: '360',
        browser: 'chrome',
      }),
    ];
    const newBuild = await createBuild('test', project, {
      previousBuildId: previousBuild.id,
    });

    await createSnapshot('snappy', newBuild, {
      width: '1280',
      browser: 'firefox',
    }),
      await createSnapshot('snappy 2', newBuild, {
        width: '720',
        browser: 'chrome',
      }),
      await createSnapshot('snappy 3', newBuild, {
        width: '360',
        browser: 'chrome',
      }),
      await createSnapshot('snappy 4', newBuild, {
        width: '360',
        browser: 'chrome',
      }),
      await newBuild.compareSnapshots();
    let updatedSnapshots = await newBuild.$relatedQuery('snapshots');
    expect(updatedSnapshots[0].previousApprovedId).toBe(
      previousSnapshots[0].id,
    );
    expect(updatedSnapshots[1].previousApprovedId).toBe(
      previousSnapshots[1].id,
    );
    expect(updatedSnapshots[2].previousApprovedId).toBe(
      previousSnapshots[2].id,
    );
    expect(updatedSnapshots[3].previousApprovedId).toBe(null);

    expect(tasks.queueCompareSnapshots).toHaveBeenCalled();
  });
});
