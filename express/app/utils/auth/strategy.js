const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GitHubStrategy = require('passport-github').Strategy;
const BitbucketStrategy = require('passport-bitbucket-oauth2').Strategy;
const GitLabStrategy = require('passport-gitlab2').Strategy;

const settings = require('../../settings');

const User = require('../../models/User');
const { loginUserWithPassword, loginUserWithProvider } = require('./login');

const localLoginStrategy = async (email, password, done) => {
  try {
    const { user, error } = await loginUserWithPassword({ email, password });
    if (error) {
      return done(null, false, error);
    }
    return done(null, user);
  } catch (error) {
    return done(error, false);
  }
};

const tryLoginWithProvider = async (req, userInfo, providerInfo, done) => {
  try {
    const { user, error } = await loginUserWithProvider({
      req,
      userInfo,
      providerInfo,
    });
    if (error) {
      return done(null, false, error);
    }
    return done(null, user);
  } catch (error) {
    return done(error, false);
  }
};

const bitbucketLoginStrategy = async (
  req,
  accessToken,
  refreshToken,
  profile,
  done,
) => {
  const providerInfo = {
    providerId: profile.id,
    provider: 'bitbucket',
    token: accessToken,
  };
  const profileImage = profile.profileImage;
  const email = profile.emails
    .filter(email => email.primary)
    .map(email => email.value)[0];

  const userInfo = {
    name: profile.displayName,
    email,
    profileImage,
  };
  await tryLoginWithProvider(req, userInfo, providerInfo, done);
};
const gitLabLoginStrategy = async (
  req,
  accessToken,
  refreshToken,
  profile,
  done,
) => {
  const providerInfo = {
    providerId: profile.id,
    provider: 'gitlab',
    token: accessToken,
  };
  const profileImage = profile.avatarUrl;
  const email = profile.emails[0].value;

  const userInfo = {
    name: profile.displayName,
    email,
    profileImage,
  };

  await tryLoginWithProvider(req, userInfo, providerInfo, done);
};

const githubLoginStrategy = async (
  req,
  accessToken,
  refreshToken,
  profile,
  done,
) => {
  const providerInfo = {
    providerId: profile.id,
    provider: 'github',
    token: accessToken,
  };
  const profileImage = profile.photos.map(p => p.value)[0];

  const email = profile.emails
    .filter(email => email.primary)
    .map(email => email.value)[0];

  const userInfo = {
    name: profile.displayName,
    email,
    profileImage,
  };
  await tryLoginWithProvider(req, userInfo, providerInfo, done);
};

passport.use(new LocalStrategy({ usernameField: 'email' }, localLoginStrategy));

if (settings.oauth.strategy.github.use) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: settings.oauth.strategy.github.clientId,
        clientSecret: settings.oauth.strategy.github.clientSecret,
        callbackURL: `${settings.site.url}/oauth/github/callback`,
        scope: ['read:user', 'user:email', 'repo:status'],
        passReqToCallback: true,
      },
      githubLoginStrategy,
    ),
  );
}

if (settings.oauth.strategy.bitbucket.use) {
  passport.use(
    new BitbucketStrategy(
      {
        clientID: settings.oauth.strategy.bitbucket.clientId,
        clientSecret: settings.oauth.strategy.bitbucket.clientSecret,
        callbackURL: `${settings.site.url}/oauth/bitbucket/callback`,
        passReqToCallback: true,
      },
      bitbucketLoginStrategy,
    ),
  );
}

if (settings.oauth.strategy.gitlab.use) {
  passport.use(
    new GitLabStrategy(
      {
        clientID: settings.oauth.strategy.gitlab.clientId,
        clientSecret: settings.oauth.strategy.gitlab.clientSecret,
        callbackURL: `${settings.site.url}/oauth/gitlab/callback`,
        passReqToCallback: true,
      },
      gitLabLoginStrategy,
    ),
  );
}

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  let user;
  try {
    user = await User.query()
      .findById(id)
      .eager('organizations')
      .eagerAlgorithm(User.JoinEagerAlgorithm);
  } catch (error) {
    console.error(error);
    return done(error, null);
  }
  if (user) {
    return done(null, user);
  }
  return done('User does not exist', null);
});

module.exports = {
  passport,
  localLoginStrategy,
  githubLoginStrategy,
};
