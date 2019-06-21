import React from 'react';

import Error from './Error.jsx';
import Layout from '../../components/Layout/Layout-redux.jsx';

export default (context, params, history, dispatch, getState) => {
  return {
    title: `Basset • Error`,
    component: <Error message={context.query.error} />,
  };
};
