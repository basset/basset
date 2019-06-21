import React from 'react';

import Organization from './controller.jsx';
import Home from '../Home-controller.jsx';

export default async (context, params, history, dispatch, getState) => {
  return {
    title: `Basset • Organizations`,
    component: (
      <Home hideSidebar>
        <Organization />
      </Home>
    ),
  };
};
