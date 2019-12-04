const github = require('./github');
const gitlab = require('./gitlab');
const bitbucket = require('./bitbucket');

const getSCM = project => {
  if (project.scmProvider === 'bitbucket') {
    return bitbucket;
  }
  if (project.scmProvider === 'github') {
    return github;
  }
  if (project.scmProvider === 'gitlab') {
    return gitlab;
  }
};

module.exports = {
  getSCM,
};
