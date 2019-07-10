export default [
  {
    path: '/:id',
    load: () =>
      import(/* webpackChunkName: 'snapshot-single' */ './single/route.jsx'),
  },
  {
    path: '/history/:projectId/:title/:width/:browser',
    load: () =>
      import(/* webpackChunkName: 'snapshot-history' */ './history/route.jsx'),
  },
];
