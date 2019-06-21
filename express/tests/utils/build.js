const Build = require('../../app/models/Build');

const createBuild = async (branch, project, args = {}) => {
  return Build.query().insertAndFetch({
    branch,
    commitSha: 'test',
    projectId: project.id,
    organizationId: project.organizationId,
    ...args,
  });
};

module.exports = {
  createBuild,
};
