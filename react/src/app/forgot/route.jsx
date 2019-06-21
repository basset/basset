import React from 'react';

import Forgot from './controller.jsx';

export default (context, params, history, dispatch, getState) => {
  return {
    title: 'Basset • Forgot Password',
    component: <Forgot />,
  };
};
