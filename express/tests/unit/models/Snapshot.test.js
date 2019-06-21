const Snapshot = require('../../../app/models/Snapshot');

const { createSnapshot } = require('../../utils/snapshot');
const { createBuild } = require('../../utils/build');
const { createProject } = require('../../utils/project');
const {
  createOrganization,
  addUserToOrganization,
} = require('../../utils/organization');
const { createUser } = require('../../utils/user');

describe('Snapshot', () => {
  let user, otherUser;
  let organization, otherOrganization;
  let project, project2, otherProject;
  let snapshot, snapshot2, otherSnapshot;
  let build, build2, otherBuild;

  beforeAll(async () => {
    user = await createUser('snapshot@snapshotmodel.io');
    organization = await createOrganization('snapshotmodel');
    await addUserToOrganization(organization.id, user.id);
    user = await user.$query().eager('organizations');

    otherUser = await createUser('snapshot@snapshotmodel2.io');
    otherOrganization = await createOrganization('snapshotmodel2');
    addUserToOrganization(otherOrganization.id, otherUser.id, true);
    otherUser = await otherUser.$query().eager('organizations');

    project = await createProject('test', organization.id);
    project2 = await createProject('test', organization.id);
    otherProject = await createProject('test', otherOrganization.id);
    build = await createBuild('test', project);
    build2 = await createBuild('test', project2);
    otherBuild = await createBuild('test', otherProject);
    snapshot = await createSnapshot('test snapshot', build, { diff: true });
    snapshot2 = await createSnapshot('test snapshot2', build2, { diff: true });
    otherSnapshot = await createSnapshot('test otherSnapshot', otherBuild);
  });

  test.each([['canRead', 'canEdit']])('%s', async prop => {
    expect(await snapshot[prop](user)).toBe(true);
    expect(await snapshot[prop](otherUser)).toBe(false);
    expect(await otherSnapshot[prop](otherUser)).toBe(true);
    expect(await otherSnapshot[prop](user)).toBe(false);
  });

  test('authorizationFilter', async () => {
    const snapshots = await Snapshot.authorizationFilter(user);
    expect(snapshots).toHaveLength(2);
    expect(snapshots).toEqual(expect.arrayContaining([snapshot, snapshot2]));

    const otherSnapshots = await Snapshot.authorizationFilter(otherUser);
    expect(otherSnapshots).toHaveLength(1);
    expect(otherSnapshots[0]).toEqual(otherSnapshot);
  });

  test('getModifiedFromBuild', async () => {
    const modifiedBuild = await createBuild('test', project);
    for await (const [index] of Array(5).entries()) {
      await createSnapshot(`${index} - snapshot`, modifiedBuild, {
        diff: false,
      });
    }
    for await (const [index] of Array(3).entries()) {
      await createSnapshot(`${index} - snapshot`, modifiedBuild, {
        diff: true,
      });
    }
    const count = await Snapshot.getModifiedFromBuild(null, modifiedBuild.id);
    expect(count).toBe(3);
  });

  test('compared', async () => {
    const newBuild = await createBuild('new build', project);
    newBuild.compared = jest.fn();
    let newSnapshot = await createSnapshot('new snap', newBuild);
    let newSnapshot2 = await createSnapshot('new snap2', newBuild);

    await newSnapshot.compared('imageLocation', 0, 'this will be null anyways');
    newSnapshot = await newSnapshot.$query();
    expect(newSnapshot.imageLocation).toBe('imageLocation');
    expect(newSnapshot.diff).toBe(false);
    expect(await newSnapshot.$relatedQuery('snapshotDiff')).not.toBeDefined();
    expect(newBuild.compared).not.toHaveBeenCalled();

    newSnapshot2.build = newBuild;
    await newSnapshot2.compared('imageLocation', 1, 'diffLocation');
    newSnapshot2 = await newSnapshot2.$query();
    expect(newSnapshot2.diff).toBe(true);
    const diff = await newSnapshot2.$relatedQuery('snapshotDiff');
    expect(diff).toBeDefined();
    expect(diff.imageLocation).toBe('diffLocation');
    expect(newBuild.compared).toHaveBeenCalled();
  });

  test('createSnapshots', async () => {
    const newBuild = await createBuild('new build', project);
    await Snapshot.createSnapshots({
      build: newBuild,
      title: 'create snapshots',
      widths: ['1', '2', '3'],
      browsers: ['firefox', 'chrome'],
      hideSelectors: [],
      selectors: ['.test', '.testing'],
      sourceLocation: 'location',
      sha: '1234ea',
    });
    const snapshots = await newBuild.$relatedQuery('snapshots');
    expect(snapshots).toHaveLength(12);
    expect(snapshots.filter(s => s.title === 'create snapshots')).toHaveLength(
      12,
    );
    expect(snapshots.filter(s => s.browser === 'firefox')).toHaveLength(6);
    expect(snapshots.filter(s => s.width === '1')).toHaveLength(4);
    expect(snapshots.filter(s => s.selector === '.test')).toHaveLength(6);
    expect(snapshots[0].sha).toBe('1234ea');
    expect(snapshots[0].sourceLocation).toBe('location');
  });
});
