export default [
  {
    path: '/create',
    load: () =>
      import(/* webpackChunkName: 'project-create' */ './create/route.jsx'),
  },
  {
    path: '/:id',
    public: true,
    load: () =>
      import(/* webpackChunkName: 'project-single' */ './single/route.jsx'),
  },
];
