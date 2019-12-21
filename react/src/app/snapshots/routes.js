export default [
  {
    path: '/:id',
    public: true,
    load: () =>
      import(/* webpackChunkName: 'snapshot-single' */ './single/route.jsx'),
  },
  {
    path: '/history/:projectId/:title/:width/:browser',
    public: true,
    load: () =>
      import(/* webpackChunkName: 'snapshot-history' */ './history/route.jsx'),
  },
];
