const github = require('./github');
const gitlab = require('./gitlab');

const getSCM = (project) => {
  return github;
};

module.exports = {
  getSCM,
};