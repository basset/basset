export default [
  {
    path: '',
    load: () => import(/* webpackChunkName: 'org-home' */ './route.jsx'),
  },
  {
    path: '/create',
    load: () =>
      import(/* webpackChunkName: 'org-create' */ './create/route.jsx'),
  },
];
