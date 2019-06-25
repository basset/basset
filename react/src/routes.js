import organizations from './app/organizations/routes.js';
import projects from './app/projects/routes.js';
import verifyAuthenitcation from './app/verfiy-authenticated.js';

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
          redirect: '/private/'
        }
      }
      return next();
    },
    children: [
      {
        path: '',
        load: () =>
          import(/* webpackChunkName: 'signup' */ './app/signup/route.jsx'),
      }
    ]

  },
  {
    path: '/private',
    load: () =>
      import(/* webpackChunkName: 'private' */'./app/private/route.jsx'),
  },
  {
    path: '/activate/:id/:token',
    load: () =>
      import(/* webpackChunkName: 'activate' */ './app/activate/route.jsx'),
  },
  {
    path: '/',
    action: verifyAuthenitcation,
    children: [
      {
        path: '/',
        load: () => import(/* webpackChunkName: 'home' */ './app/route.jsx'),
      },
      {
        path: '/organizations',
        children: organizations,
      },
      {
        path: '/profile',
        load: () =>
          import(/* webpackChunkName: 'home' */ './app/profile/route.jsx'),
      },
      {
        path: '/projects',
        children: projects,
      },
      {
        path: '/builds/:id/:snapshotId?',
        load: () =>
          import(/* webpackChunkName: 'build-single' */ './app/builds/route.jsx'),
      },
      {
        path: '/snapshots/:id',
        load: () =>
          import(/* webpackChunkName: 'snapshot-single' */ './app/snapshots/route.jsx'),
      },
      {
        path: '/oauth-error/',
        load: () =>
          import(/* webpackChunkName: 'oauth-error' */ './app/oauth-error/route.jsx'),
      },
      {
        path: '(.*)',
        load: () =>
          import(/* webpackChunkName: 'not-found' */ './app/404/route.jsx'),
      },
    ],
  },
];
