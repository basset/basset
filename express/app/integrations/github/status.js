const request = require('request');
const settings = require('../../settings');

const updateStatus = ({
  owner,
  repo,
  token,
  sha,
  state,
  url,
  description,
  context,
}) => {
  return request.post(
    {
      url: `https://api.github.com/repos/${owner}/${repo}/statuses/${sha}`,
      json: true,
      body: {
        state,
        target_url: url,
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
    owner: project.scmConfig.repoOwner,
    repo: project.scmConfig.repoName,
    sha: build.commitSha,
    url: `${settings.site.url}/projects/${project.id}`,
    state: 'pending',
    description: 'Snapshots are being rendered and compared',
    context: 'Basset',
  });
};

const snapshotsApproved = (project, build) => {
  return updateStatus({
    token: project.scmToken,
    owner: project.scmConfig.repoOwner,
    repo: project.scmConfig.repoName,
    sha: build.commitSha,
    url: `${settings.site.url}/builds/${build.id}`,
    state: 'success',
    description: 'Snapshots have been approved',
    context: 'Basset',
  });
};

const snapshotsNoDiffs = (project, build) => {
  return updateStatus({
    token: project.scmToken,
    owner: project.scmConfig.repoOwner,
    repo: project.scmConfig.repoName,
    sha: build.commitSha,
    url: `${settings.site.url}/builds/${build.id}`,
    state: 'success',
    description: 'Snapshots have no diffs',
    context: 'Basset',
  });
};

const snapshotsNeedApproving = (project, build) => {
  return updateStatus({
    token: project.scmToken,
    owner: project.scmConfig.repoOwner,
    repo: project.scmConfig.repoName,
    sha: build.commitSha,
    url: `${settings.site.url}/builds/${build.id}`,
    state: 'failure',
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
