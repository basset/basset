const User = require('../models/User');
const { compareToken } = require('./auth/token');
const { decode } = require('./safe-base64');
const { sendActivationEmail, sendWelcomeEmail } = require('./email');
const { loginSuccessful, getClientInfo } = require('./auth/access');

const createUser = async (
  db,
  user,
  { sendEmail = true, organizationId = null } = {},
) => {
  const newUser = await User.query(db).insertAndFetch(user);

  if (organizationId) {
    await addUserToOrganization(db, newUser, organizationId);
  }

  if (sendEmail) {
    await sendActivationEmail(newUser);
  }

  return newUser;
};

const addUserToOrganization = async (db, user, organizationId) => {
  return user.$relatedQuery('organizationMemberships', db).insert({
    userId: user.id,
    organizationId,
  });
};

const validateToken = async (uidb64, token, { active = false } = {}) => {
  const userId = decode(uidb64);
  let user;
  try {
    user = await User.query()
      .where('id', userId)
      .first();
  } catch (error) {
    throw new Error('Invalid token.');
  }
  if (!user) {
    throw new Error('Invalid token.');
  }
  if (active && !user.active) {
    throw new Error('Invalid token.'); // password reset
  }
  if (!compareToken(user, token)) {
    throw new Error('Invalid token.');
  }
  return user;
};

const activateUserFromToken = async (db, req, uidb64, token) => {
  let user = await validateToken(uidb64, token);

  user = await user.$query(db).updateAndFetch({
    active: true,
    lastLogin: User.knex().fn.now(),
  });

  await loginSuccessful({ email: user.email, ...getClientInfo(req) });
  await sendWelcomeEmail(user);

  req.login(user, () => {});

  return user;
};

module.exports = {
  createUser,
  activateUserFromToken,
  validateToken,
  addUserToOrganization,
};
