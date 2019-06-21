import React from 'react';

import Activate from './controller.jsx';

export default (context, params, history, dispatch, getState) => {
  return {
    title: 'Basset • Activate your account',
    component: <Activate id={params.id} token={params.token} />,
  };
};
