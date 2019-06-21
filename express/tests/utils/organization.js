const Organization = require('../../app/models/Organization');
const OrganizationMember = require('../../app/models/OrganizationMember');

const createOrganization = async name => {
  return Organization.query().insertAndFetch({
    name,
  });
};

const addUserToOrganization = async (organizationId, userId, admin = false) => {
  return OrganizationMember.query().insertAndFetch({
    organizationId,
    userId,
    admin,
  });
};

module.exports = {
  createOrganization,
  addUserToOrganization,
};
