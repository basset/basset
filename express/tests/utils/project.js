const Project = require('../../app/models/Project');

const createProject = async (name, organizationId, args = {}) => {
  return Project.query().insertAndFetch({
    name,
    organizationId,
    ...args,
  });
};

module.exports = {
  createProject,
};
