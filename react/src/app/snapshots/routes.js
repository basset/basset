export default [
  {
    path: '/:id',
    load: () =>
      import(/* webpackChunkName: 'snapshot-single' */ './single/route.jsx'),
  },
  {
    path: '/search/:projectId/:title',
    load: () =>
      import(/* webpackChunkName: 'snapshot-search' */ './search/route.jsx'),
  },
];
