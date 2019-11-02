let mockPost = jest.fn();
jest.mock('request', () => {
  const request = require.requireActual('request');
  request.post = mockPost;
  return request;
});
const request = require('request');
const settings = require('../../../../app/settings');

const status = require('../../../../app/integrations/github/status');

const { createBuild } = require('../../../utils/build');
const { createProject } = require('../../../utils/project');
const { createOrganization } = require('../../../utils/organization');

describe('status integration', () => {
  let project, build, organization;
  beforeAll(async () => {
    organization = await createOrganization('builder');
    project = await createProject('testr', organization.id, {
      scmConfig: JSON.stringify({
        repoOwner: 'bassetio',
        repoName: 'basset',
      }),
      scmToken: 'repoToken',
    });
    build = await createBuild('master', project, { commitSha: 'sha1' });
  });
  test.each([
    [
      'snapshotsPending',
      'pending',
      'Snapshots are being rendered and compared',
      'projects',
    ],
    ['snapshotsApproved', 'success', 'Snapshots have been approved', 'builds'],
    ['snapshotsNoDiffs', 'success', 'Snapshots have no diffs', 'builds'],
    [
      'snapshotsNeedApproving',
      'failure',
      'Snapshots need to be approved',
      'builds',
    ],
  ])('%s', async (prop, state, description, url) => {
    await status[prop](project, build);

    expect(mockPost).toHaveBeenLastCalledWith(
      expect.objectContaining({
        body: {
          context: 'Basset',
          description,
          state,
          target_url: expect.stringContaining(url),
        },
        headers: expect.objectContaining({
          Authorization: 'token repoToken',
        }),
        url: expect.stringContaining('repos/bassetio/basset'),
      }),
      expect.any(Function),
    );
  });
});
