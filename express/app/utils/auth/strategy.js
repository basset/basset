const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GitHubStrategy = require('passport-github').Strategy;

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
