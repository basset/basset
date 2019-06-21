import React from 'react';

import CreateOrganization from './controller.jsx';
import Layout from '../../../components/Layout/Layout-redux.jsx';

export default (context, params, history, dispatch, getState) => {
  return {
    title: 'Basset • Create organization',
    component: (
      <Layout>
        <CreateOrganization />
      </Layout>
    ),
  };
};
