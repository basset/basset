const promisify = require('util').promisify;
const request = promisify(require('request'));

const getPullRequests = async ({ owner, repo, token, sha }) => {
  const response = await request({
    url: `https://api.github.com/search/issues?q=state:open+type:pr+repo:${owner}/${repo}+SHA:${sha}`,
    headers: {
      Authorization: `token ${token}`,
      'User-Agent': 'Basset.io',
    },
  });
  if (response.error) {
    console.error(response.error);
  }
  return JSON.parse(response.body).items;
};

const getPullRequest = async ({ url, token }) => {
  const response = await request({
    url: url,
    headers: {
      Authorization: `token ${token}`,
      'User-Agent': 'Basset.io',
    },
  });
  if (response.error) {
    console.error(response.error);
  }
  return JSON.parse(response.body);
};

const getBaseSHA = async (project, sha) => {
  const pullRequests = await getPullRequests({
    owner: project.scmConfig.repoOwner,
    repo: project.scmConfig.repoName,
    token: project.scmToken,
    sha,
  });
  if (pullRequests && pullRequests.length > 0) {
    const pullRequestData = await getPullRequest({
      url: pullRequests[0].pull_request.url,
      token,
    });

    return pullRequestData.base.sha;
  }
  return null;
};

module.exports = {
  getBaseSHA,
  getPullRequests,
  getPullRequest,
};
