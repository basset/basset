const promisify = require('util').promisify;
const request = promisify(require('request'));

const getPullRequests = async ({ username, repoSlug, token, sha }) => {
  const response = await request({
    url: `https://api.bitbucket.com/2.0/repositories/${username}/${repoSlug}/commit/${sha}/pullrequests?pagelen=10`,
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

const getPullRequest = async ({ url, token }) => {
  const response = await request({
    url: url,
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
  const pullRequests = await getPullRequests({
    username: project.scmConfig.username,
    repoSlug: project.scmConfig.repoSlug,
    token: project.scmToken,
    sha,
  });
  if (pullRequests.values && pullRequests.values.length > 0) {
    const pullRequestData = await getPullRequest({
      url: pullRequests.values[0].links.self.href,
      token,
    });

    return pullRequestData.destination.commit.hash;
  }
  return null;
};


module.exports = {
  getBaseSHA,
  getPullRequests,
  getPullRequest,
};
