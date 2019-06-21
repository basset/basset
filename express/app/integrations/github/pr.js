const promisify = require('util').promisify;
const request = promisify(require('request'));

const getPRs = async ({ owner, repo, token, sha }) => {
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

const getPR = async ({ url, token }) => {
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

module.exports = {
  getPRs,
  getPR,
};
