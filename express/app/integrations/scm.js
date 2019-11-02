const github = require('./github');
const gitlab = require('./gitlab');

const getSCM = project => {
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
