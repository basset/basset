const builds = require('../../../app/tasks/builds');
const { createBuild } = require('../../utils/build');
const { createProject } = require('../../utils/project');
const { createOrganization } = require('../../utils/organization');
const { createSnapshot } = require('../../utils/snapshot');

describe('build tasks', () => {
  let project, organization;
  beforeAll(async () => {
    organization = await createOrganization('builder');
    project = await createProject('tester', organization.id);
  });
  test('monitorBuildStats error when 20 minutes have passed with 0 snapshots', async () => {
    jest.useFakeTimers();
    let build = await createBuild('master', project);
    const date = new Date();
    date.setMinutes(date.getMinutes() - 21);
    build.__proto__.$beforeUpdate = () => {};
    await build.$query().update({
      updatedAt: date.toISOString(),
    });
    await builds.monitorBuildStatus({ buildId: build.id });
    build = await build.$query();
    expect(build.error).toBe(true);
  });

  test('monitorBuildStats error when last snapshot is greater than 20 minutes from now', async () => {
    jest.useFakeTimers();
    let build = await createBuild('master', project);
    const snapshot = await createSnapshot('test', build);
    const date = new Date();
    date.setMinutes(date.getMinutes() - 21);
    snapshot.__proto__.$beforeUpdate = () => {};

    await snapshot.$query().update({
      updatedAt: date.toISOString(),
    });

    await builds.monitorBuildStatus({ buildId: build.id });
    build = await build.$query();
    expect(build.error).toBe(true);
  });

  test('monitorBuildStats will run until build is completed', async () => {
    jest.useFakeTimers();
    jest.resetAllMocks();
    jest.clearAllTimers();
    let build = await createBuild('master', project);
    await builds.monitorBuildStatus({ buildId: build.id });
    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 60000);
    build = await build.$query();
    expect(build.error).toBe(null);
    await build.$query().update({
      completedAt: new Date().toISOString(),
    });
    jest.advanceTimersByTime(60000);
    const date = new Date();
    date.setMinutes(date.getMinutes() - 21);
    build.__proto__.$beforeUpdate = () => {};
    await build.$query().update({
      updatedAt: date.toISOString(),
      completedAt: null,
    });
    jest.advanceTimersByTime(60000);
    build = await build.$query();
    expect(build.error).toBe(null);
  });
});
