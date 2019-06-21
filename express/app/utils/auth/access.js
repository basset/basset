const AccessAttempt = require('../../models/AccessAttempt');
const AccessLog = require('../../models/AccessLog');
const User = require('../../models/User');

const resetExpiredAttempts = async email => {
  try {
    const expiredAt = new Date();
    expiredAt.setMinutes(expiredAt.getMinutes() - 5);

    const lockedEmails = await AccessAttempt.query()
      .where('accessAttempt.createdAt', '<', expiredAt)
      .map(a => a.email);
    await User.query()
      .update({ locked: false })
      .whereIn('email', lockedEmails);
    const query = AccessAttempt.query()
      .delete()
      .where('createdAt', '<', expiredAt);

    if (email) {
      query.orWhere('email', email);
    }
    await query;
  } catch (err) {
    console.error(err);
  }
};

const loginFailed = async ({ email, ipAddress, userAgent }) => {
  const accessAttempt = await AccessAttempt.query()
    .where({
      email,
    })
    .first();
  if (accessAttempt) {
    const failures = accessAttempt.failureAttempt + 1;
    await accessAttempt.$query().update({
      failureAttempt: failures,
    });
    const user = await User.query().findOne({ email, locked: false });
    if (user && failures > 4) {
      await user.$query().update({
        locked: true,
      });
    }
    return true;
  } else {
    await AccessAttempt.query().insert({
      email,
      ipAddress,
      userAgent,
      failureAttempt: 1,
    });
  }
  return false;
};

const loginSuccessful = async ({ email, ipAddress, userAgent }) => {
  await resetExpiredAttempts(email);
  await AccessLog.query().insert({
    email,
    ipAddress,
    userAgent,
  });
};

const getClientInfo = req => ({
  ipAddress:
    req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    (req.connection.socket ? req.connection.socket.remoteAddress : null),
  userAgent: req.headers['user-agent'],
});

module.exports = {
  loginFailed,
  loginSuccessful,
  getClientInfo,
  resetExpiredAttempts,
};
