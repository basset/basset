const request = require('request');
const settings = require('../../settings');

const updateStatus = ({
  username,
  repoSlug,
  sha,
  state,
  url,
  description,
  context,
}) => {
  return request.post(
    {
      url: `https://api.bitbucket.com/2.0/repositories/${username}/${repoSlug}/commit/${sha}/statuses`,
      json: true,
      body: {
        state,
        name: 'basset-snapshots',
        key: 'basset-snapshots',
        url,
        description,
        context,
      },
      headers: {
        Authorization: `token ${token}`,
        'User-Agent': 'Basset.io',
      },
    },
    (error, response, body) => {
      if (response.statusCode !== 201) {
        console.error(
          `There was an error updating the github repo status: ${JSON.parse(
            response.body,
          )}`,
        );
      }
      if (error) {
        console.error(error);
      }
    },
  );
};

const snapshotsPending = (project, build) => {
  return updateStatus({
    token: project.scmToken,
    username: project.scmConfig.username,
    repoSlug: project.scmConfig.repoSlug,
    sha: build.commitSha,
    url: `${settings.site.url}/projects/${project.id}`,
    state: 'INPROGRESS',
    description: 'Snapshots are being rendered and compared',
    context: 'Basset',
  });
};

const snapshotsApproved = (project, build) => {
  return updateStatus({
    token: project.scmToken,
    username: project.scmConfig.username,
    repoSlug: project.scmConfig.repoSlug,
    sha: build.commitSha,
    url: `${settings.site.url}/builds/${build.id}`,
    state: 'SUCCESSFUL',
    description: 'Snapshots have been approved',
    context: 'Basset',
  });
};

const snapshotsNoDiffs = (project, build) => {
  return updateStatus({
    token: project.scmToken,
    username: project.scmConfig.username,
    repoSlug: project.scmConfig.repoSlug,
    sha: build.commitSha,
    url: `${settings.site.url}/builds/${build.id}`,
    state: 'SUCCESSFUL',
    description: 'Snapshots have no diffs',
    context: 'Basset',
  });
};

const snapshotsNeedApproving = (project, build) => {
  return updateStatus({
    token: project.scmToken,
    username: project.scmConfig.username,
    repoSlug: project.scmConfig.repoSlug,
    sha: build.commitSha,
    url: `${settings.site.url}/builds/${build.id}`,
    state: 'FAILED',
    description: 'Snapshots need to be approved',
    context: 'Basset',
  });
};

module.exports = {
  snapshotsPending,
  snapshotsApproved,
  snapshotsNeedApproving,
  snapshotsNoDiffs,
};
