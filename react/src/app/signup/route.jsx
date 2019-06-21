import React from 'react';

import Signup from './controller.jsx';

export default async (context, params, history, dispatch, getState) => {
  return {
    title: 'Basset • Sign up',
    component: <Signup />,
  };
};
