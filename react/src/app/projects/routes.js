export default [
  {
    path: '/create',
    load: () =>
      import(/* webpackChunkName: 'project-create' */ './create/route.jsx'),
  },
  {
    path: '/:id',
    load: () =>
      import(/* webpackChunkName: 'project-single' */ './single/route.jsx'),
  },
];
