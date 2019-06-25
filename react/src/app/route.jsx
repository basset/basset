import React from 'react';

import Home from './Home-controller.jsx';

export default (context, params, history, dispatch, getState) => {
  const { currentProjectId } = getState().projects;
  if (currentProjectId) {
    return {
      redirect: `/projects/${currentProjectId}`,
    };
  }
  return {
    title: 'Basset • Home',
    component: <Home />,
  };
};
