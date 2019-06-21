import React from 'react';

import NotFound from './404.jsx';
import Layout from '../../components/Layout/Layout-redux.jsx';

export default (context, params, history, dispatch, getState) => {
  return {
    title: `Basset • 404 Not found`,
    component: (
      <Layout>
        <NotFound />
      </Layout>
    ),
  };
};
