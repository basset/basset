const bcrypt = require('bcrypt');
const { transaction } = require('objection');
const passport = require('passport');

const User = require('../../models/User');
const Project = require('../../models/Project');
const OrganizationInvite = require('../../models/OrganizationInvite');
const UserProvider = require('../../models/UserProvider');
const settings = require('../../settings');
const { addUserToOrganization } = require('../registration');

const {
  loginFailed,
  loginSuccessful,
  getClientInfo,
  resetExpiredAttempts,
} = require('./access');

const updateUserLogin = user => {
  return user.$query().updateAndFetch({
    lastLogin: User.knex().fn.now(),
  });
};

const loginUserWithPassword = async ({ email, password }) => {
  await resetExpiredAttempts();
  const user = await User.query()
    .where('email', email)
    .first();

  if (!user) {
    return { error: 'Invalid credentials.' };
  }
  if (!user.active) {
    return { error: 'Account is inactive.' };
  }
  if (user.locked) {
    return { error: 'Account is locked for 5 minutes.' };
  }
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return { error: 'Invalid credentials.' };
  }
  return { user: await updateUserLogin(user) };
};

const loginUserWithProvider = async ({ req, userInfo, providerInfo }) => {
  let trx;
  try {
    await resetExpiredAttempts();
    trx = await transaction.start(User.knex());
    let user;
    if (req.user) {
      user = await User.loadRelated([req.user], 'providers').first(); // we don't want to mutate req.user
      const accountExists = await User.query()
        .joinRelation('providers')
        .whereNot('user.email', req.user.email)
        .where('providers.provider', providerInfo.provider)
        .where('providers.providerId', providerInfo.providerId)
        .first();
      if (accountExists) {
        await trx.rollback();
        return {
          error: `This ${
            providerInfo.provider
          } account has already been registered to a different user.`,
        };
      }
    }

    if (!user) {
      const results = await User.query()
        .leftOuterJoinRelation('providers')
        .eager('providers')
        .where('user.email', userInfo.email)
        .orWhere(builder =>
          builder
            .where('providers.provider', providerInfo.provider)
            .where('providers.providerId', providerInfo.providerId),
        );
      user =
        results.length > 1
          ? results.find(
              r =>
                r.providers.find(
                  p => p.providerId === providerInfo.providerId,
                ) !== null,
            )
          : results[0];
    }

    if (user) {
      if (!user.active) {
        await trx.rollback();
        return { error: 'Account is inactive.' };
      }
      const foundProvider = user.providers.find(
        p =>
          p.providerId === providerInfo.providerId && p.provider === p.provider,
      );
      if (foundProvider) {
        await Project.updateSCMToken(
          trx,
          user,
          foundProvider,
          providerInfo.token,
        );
        await foundProvider.$query(trx).update({
          ...providerInfo,
        });
      } else {
        await UserProvider.query(trx).insert({
          ...providerInfo,
          userId: user.id,
        });
      }
      if (!user.profileImage) {
        await user.$query(trx).update({
          profileImage: userInfo.profileImage,
        });
      }
      await trx.commit();
      return { user: await updateUserLogin(user) };
    }
    const invite = await OrganizationInvite.query()
      .where('email', userInfo.email)
      .first();
    if (!settings.site.private || invite) {
      user = await User.query(trx).insertAndFetch({
        ...userInfo,
        active: true,
        lastLogin: User.knex().fn.now(),
      });

      await UserProvider.query(trx).insert({
        ...providerInfo,
        userId: user.id,
      });

      if (invite) {
        await invite.$query(trx).update({
          accepted: true,
        });
        await addUserToOrganization(trx, user, invite.organizationId);
      }

      await trx.commit();
      return { user };
    }
    await trx.rollback();
    return { error: 'User not found.' };
  } catch (error) {
    await trx.rollback();
    console.error(error);
    return { error: 'Error finding user' }
  }
};

const attemptLogin = ({ req, res }, email, password) =>
  new Promise((resolve, reject) => {
    const auth = passport.authenticate('local', async (error, user, info) => {
      if (error) {
        return reject(error);
      }
      if (!user) {
        try {
          await loginFailed({ email, ...getClientInfo(req) });
        } catch (err) {
          return reject(err);
        }
        reject(info);
      } else {
        req.login(user, async error => {
          if (error) {
            await loginFailed({ email, ...getClientInfo(req) });
            reject(error);
          } else {
            await loginSuccessful({ email, ...getClientInfo(req) });
            resolve(user);
          }
        });
      }
    });
    req.query = { email, password };
    auth(req, res, args => {});
  });

module.exports = {
  loginUserWithPassword,
  loginUserWithProvider,
  attemptLogin,
};
