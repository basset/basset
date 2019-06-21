import React from 'react';

import CreateProject from './controller.jsx';
import Home from '../../Home-controller.jsx';

export default (context, params, history, dispatch, getState) => {
  return {
    title: 'Basset • project',
    component: (
      <Home>
        <CreateProject />
      </Home>
    ),
  };
};
