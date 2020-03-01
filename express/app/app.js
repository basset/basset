const express = require('express');
const path = require('path');
const morgan = require('morgan');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');

const csrfProtection = csrf({ cookie: true });
if (!process.env.TEST) {
  const { configureQueue } = require('./tasks/queueCompareSnapshots');
  configureQueue();
}

const settings = require('./settings');
const { passport } = require('./utils/auth/strategy');
const ApolloServer = require('./utils/graphql/protected-apollo-server');
const plugins = require('./plugins');

const app = express();

const knex = require('./db').configure();

const sessionOptions = {
  secret: settings.secret,
  resave: false,
  saveUninitialized: false,
};

if (settings.session.useDB) {
  const KnexSessionStore = require('connect-session-knex')(session);
  sessionOptions.store = new KnexSessionStore({
    knex: knex,
  });
} else {
  const RedisStore = require('connect-redis')(session);
  sessionOptions.store = new RedisStore({
    host: settings.session.redisHost,
    port: settings.session.redisPort,
  });
}

plugins.import(app).then(async () => {
  await plugins.beforeMiddleware(app);
  app.use(cookieParser());
  app.use(session(sessionOptions));
  app.use(morgan('combined'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  app.use(passport.initialize());
  app.use(passport.session(), (err, req, res, next) => {
    if (err) {
      if (err === 'User does not exist') {
        req.logOut();
        return res.redirect('/login');
      } else {
        console.error(err);
        return res.status(500);
      }
    }
    next(err);
  });
  app.use(express.static(path.join(__dirname, '..', 'static')));
  app.set('view engine', 'ejs');

  await plugins.afterMiddleware(app);

  const schema = require('./schema/schema');

  const server = new ApolloServer({
    schema,
    formatError: error => {
      if (settings.env === 'PRODUCTION') {
        delete error.extensions.exception;
      }
      console.error(error);
      return error;
    },
    context: context => ({
      req: context.req,
      res: context.res,
      loaders: [],
    }),
    playground: {
      settings: {
        'request.credentials': 'include',
      },
    },
    uploads: {
      maxFileSize: 10000000, // 10 MB
      maxFiles: 20,
    },
  });

  app.use('/graphql', csrfProtection);

  server.applyMiddleware({
    app,
    cors: settings.cors,
  });

  const saveRedirect = (req, res, next) => {
    if (req.query.redirect) {
      req.session.redirect = req.query.redirect;
    }
    return next();
  };

  const redirect = (req, res) => {
    res.redirect(req.session.redirect || '/');
    req.session.redirect = '';
  };
  const authenticate = provider => (
    (req, res, next) => {
      passport.authenticate(provider, (error, user, info) => {
        if (error) {
          return res.status(500);
        }
        if (!user) {
          if (settings.site.private) {
            return res.redirect('/private');
          }
          return res.redirect(`/oauth-error/?error=${info}`);
        }
        req.login(user, err => {
          if (err) {
            return next(err);
          }
          return next();
        })
      })(req, res, next)
    }
  );

  await plugins.beforeControllers(app);
  app.get(
    '/oauth/:provider(github|bitbucket|gitlab)',
    saveRedirect,
    (req, res, next) =>
      passport.authenticate(req.params.provider)(req, res, next),
  );
  app.get(
    '/saml/',
    saveRedirect,
    passport.authenticate('saml')
  );
  app.post(
    '/saml/callback',
    authenticate('saml'),
    redirect,
  );
  app.get(
    '/oauth/:provider(github|bitbucket|gitlab)/callback',
    (req, res, next) => authenticate(req.params.provider)(req, res, next),
    redirect
  );
  app.use('/build', require('./routes/build'));
  app.use('/screenshots', require('./routes/screenshots'));
  app.use('/snapshot_source', require('./routes/snapshots'));

  const public_urls = ['/reset*', '/forgot', '/signup', '/login'];
  const render = ['index', {settings}];

  app.get(public_urls, csrfProtection, (req, res) => {
    if (req.user) {
      return res.redirect('/');
    }
    res.cookie('_bcsrf', req.csrfToken());
    res.render(...render);
  });
  app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/login');
  });
  app.get('*', csrfProtection, (req, res) => {
    res.cookie('_bcsrf', req.csrfToken());
    res.render(...render);
  });

  await plugins.afterControllers(app);
});

module.exports = app;
