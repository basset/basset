const SnapshotDiff = require('../../../app/models/SnapshotDiff');

const { createSnapshotDiff } = require('../../utils/snapshot-diff');
const { createSnapshot } = require('../../utils/snapshot');
const { createBuild } = require('../../utils/build');
const { createProject } = require('../../utils/project');
const {
  createOrganization,
  addUserToOrganization,
} = require('../../utils/organization');
const { createUser } = require('../../utils/user');

describe('SnapshotDiff', () => {
  let user, otherUser;
  let organization, otherOrganization;
  let project, otherProject;
  let build, previousBuild, otherBuild, otherPreviousBuild;
  let fromSnapshot, toSnapshot, fromOtherSnapshot, toOtherSnapshot;
  let snapshotDiff, otherSnapshotDiff;

  beforeAll(async () => {
    user = await createUser('snapshotdiff@SnapshotDiff.io');
    organization = await createOrganization('snapshotmodel');
    await addUserToOrganization(organization.id, user.id, true);
    user = await user.$query().eager('organizations');

    otherUser = await createUser('snapshot@OtherSnapshotDiff.io');
    otherOrganization = await createOrganization('snapshotmodel2');
    addUserToOrganization(otherOrganization.id, otherUser.id, true);
    otherUser = await otherUser.$query().eager('organizations');

    project = await createProject('test', organization.id);
    otherProject = await createProject('test', otherOrganization.id);

    previousBuild = await createBuild('master', project);
    fromSnapshot = await createSnapshot('from snapshot', previousBuild);

    build = await createBuild('master', project, {
      previousBUildId: previousBuild.id,
    });
    toSnapshot = await createSnapshot('from snapshot', build);
    snapshotDiff = await createSnapshotDiff(fromSnapshot, toSnapshot, build);

    otherPreviousBuild = await createBuild('master', otherProject);
    fromOtherSnapshot = await createSnapshot('from snapshot', previousBuild);

    otherBuild = await createBuild('master', otherProject, {
      previousBUildId: otherPreviousBuild.id,
    });
    toOtherSnapshot = await createSnapshot('from snapshot', otherBuild);
    otherSnapshotDiff = await createSnapshotDiff(
      fromOtherSnapshot,
      toOtherSnapshot,
      otherBuild,
    );
  });

  test('canRead', async () => {
    expect(await snapshotDiff.canRead(user)).toBe(true);
    expect(await snapshotDiff.canRead(otherUser)).toBe(false);
    expect(await otherSnapshotDiff.canRead(otherUser)).toBe(true);
    expect(await otherSnapshotDiff.canRead(user)).toBe(false);
  });

  test('authorizationFilter', async () => {
    const snapshotDiffs = await SnapshotDiff.authorizationFilter(user);
    expect(snapshotDiffs).toHaveLength(1);
    expect(snapshotDiffs).toEqual([snapshotDiff]);

    const otherSnapshotDiffs = await SnapshotDiff.authorizationFilter(
      otherUser,
    );
    expect(otherSnapshotDiffs).toHaveLength(1);
    expect(otherSnapshotDiffs).toEqual([otherSnapshotDiff]);
  });
});
