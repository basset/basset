import organizations from './app/organizations/routes.js';
import projects from './app/projects/routes.js';
import snapshots from './app/snapshots/routes.js';
import verifyAuthenticated from './app/verify-authenticated.js';

export default [
  {
    path: '/invite/:id/:token',
    load: () =>
      import(/* webpackChunkName: 'login' */ './app/invite/route.jsx'),
  },
  {
    path: '/login',
    load: () => import(/* webpackChunkName: 'login' */ './app/login/route.jsx'),
  },
  {
    path: '/forgot',
    load: () =>
      import(/* webpackChunkName: 'forgot' */ './app/forgot/route.jsx'),
  },
  {
    path: '/reset/:id/:token',
    load: () => import(/* webpackChunkName: 'reset' */ './app/reset/route.jsx'),
  },
  {
    path: '/signup',
    action: ({ next }, params, history, dispatch, getState) => {
      if (__BASSET__.private) {
        return {
          redirect: '/private/',
        };
      }
      return next();
    },
    children: [
      {
        path: '',
        load: () =>
          import(/* webpackChunkName: 'signup' */ './app/signup/route.jsx'),
      },
    ],
  },
  {
    path: '/private',
    load: () =>
      import(/* webpackChunkName: 'private' */ './app/private/route.jsx'),
  },
  {
    path: '/activate/:id/:token',
    load: () =>
      import(/* webpackChunkName: 'activate' */ './app/activate/route.jsx'),
  },
  {
    path: '/',
    verifyAuthentication: true,
    load: () => import(/* webpackChunkName: 'home' */ './app/route.jsx'),
  },
  {
    path: '/organizations',
    verifyAuthentication: true,
    children: organizations,
  },
  {
    path: '/profile',
    verifyAuthentication: true,
    load: () =>
      import(/* webpackChunkName: 'home' */ './app/profile/route.jsx'),
  },
  {
    path: '/projects',
    verifyAuthentication: true,
    public: true,
    children: projects,
  },
  {
    path: '/builds/:id/:snapshotId?',
    verifyAuthentication: true,
    public: true,
    load: () =>
      import(/* webpackChunkName: 'build-single' */ './app/builds/route.jsx'),
  },
  {
    path: '/snapshots',
    verifyAuthentication: true,
    public: true,
    children: snapshots,
  },
  {
    path: '/oauth-error/',
    verifyAuthentication: true,
    public: true,
    load: () =>
      import(/* webpackChunkName: 'oauth-error' */ './app/oauth-error/route.jsx'),
  },
  {
    path: '(.*)',
    verifyAuthentication: true,
    load: () =>
      import(/* webpackChunkName: 'not-found' */ './app/404/route.jsx'),

  },
];
