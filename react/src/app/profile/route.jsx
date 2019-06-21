import React from 'react';

import Home from '../Home-controller.jsx';
import Profile from './controller.jsx';

export default (context, params, history, dispatch, getState) => {
  return {
    title: 'Basset • Profile',
    component: (
      <Home>
        <Profile />
      </Home>
    ),
  };
};
