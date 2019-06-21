import React from 'react';

import Private from './Private.jsx';

export default async (context, params, history, dispatch, getState) => {
  return {
    title: 'Basset • Private',
    component: <Private />,
  };
};
