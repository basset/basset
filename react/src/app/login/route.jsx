import React from 'react';

import Login from './controller.jsx';

export default async (context, params, history, dispatch, getState) => {
  const redirect = context.query.redirect || null;
  return {
    title: 'Basset • Log In',
    component: <Login redirect={redirect} />,
  };
};
