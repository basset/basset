const request = require('request');
const settings = require('../../settings');

const updateStatus = ({
  projectId,
  token,
  sha,
  state,
  url,
  description,
  context,
}) => {
  const requestUrl = `https://api.gitlab.com/api/v4/projects/${projectId}/statuses/${sha}?state=${state}&target_url=${url}&description=${description}&context=${context}`;
  return request.post(
    {
      url: requestUrl,
      headers: {
        'PRIVATE-TOKEN': token,
        'User-Agent': 'Basset.io',
      },
    },
    (error, response, body) => {
      if (response.statusCode !== 201) {
        console.error(
          `There was an error updating the gitlab commit status: ${JSON.parse(
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
  const token = '';
  return updateStatus({
    token: project.scmToken,
    projectId: project.scmConfig.projectId,
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
    projectId: project.scmConfig.projectId,
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
    projectId: project.scmConfig.projectId,
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
    projectId: project.scmConfig.projectId,
    sha: build.commitSha,
    url: `${settings.site.url}/builds/${build.id}`,
    state: 'failed',
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
