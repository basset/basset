import React from 'react';

import Reset from './controller.jsx';

export default (context, params, history, dispatch, getState) => {
  return {
    title: 'Basset • Reset password',
    component: <Reset id={params.id} token={params.token} />,
  };
};
