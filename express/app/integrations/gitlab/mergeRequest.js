const promisify = require('util').promisify;
const request = promisify(require('request'));

const getMergeRequests = async ({ projectId, token, sha }) => {
  const response = await request({
    url: `https://api.gitlab.com/api/v4/projects/${projectId}/repository/commits/${sha}/merge_requests`,
    headers: {
      Authorization: `Bearer ${token}`,
      'User-Agent': 'Basset.io',
    },
  });
  if (response.error) {
    console.error(response.error);
  }
  return JSON.parse(response.body).items;
};

const getMergeRequest = async ({ projectId, token, mergeRequestId }) => {
  const response = await request({
    url: `https://api.gitlab.com/api/v4/projects/${projectId}/merge_requests/${mergeRequestId}`,
    headers: {
      Authorization: `Bearer ${token}`,
      'User-Agent': 'Basset.io',
    },
  });
  if (response.error) {
    console.error(response.error);
  }
  return JSON.parse(response.body);
};

const getBaseSHA = async (project, sha) => {
  const mergeRequest = await getMergeRequests({
    token: project.scmToken,
    projectId: project.scmConfig.projectId,
    sha,
  });
  if (mergeRequest && mergeRequest.length > 0) {
    const mergeRequestData = await getMergeRequest({
      token: project.scmToken,
      projectId: project.scmConfig.projectId,
      mergeRequestId: mergeRequest.iid,
    });
    return mergeRequestData.diff_refs.base_sha;
  }
  return null;
};

module.exports = {
  getBaseSHA,
  getMergeRequests,
  getMergeRequest,
};
