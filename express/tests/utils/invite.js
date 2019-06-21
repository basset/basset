const UserInvite = require('../../app/models/OrganizationInvite');

const { generateToken } = require('../../app/utils/auth/token');

const createInvite = async (email, fromMember, organizationId, args = {}) => {
  return UserInvite.query().insertAndFetch({
    email,
    fromId: fromMember.id,
    token: generateToken(fromMember),
    organizationId,
    ...args,
  });
};

module.exports = {
  createInvite,
};
