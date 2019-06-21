import React from 'react';

import Home from '../../Home-controller.jsx';
import {
  changeProject,
  checkLocationKey,
} from '../../../redux/projects/actions.js';

import Project from './controller.jsx';

export default async (context, params, history, dispatch, getState) => {
  const id = params.id;
  await dispatch(changeProject({ id }));
  await dispatch(checkLocationKey(history.location.key));
  return {
    title: 'Basset • Project',
    component: (
      <Home>
        <Project />
      </Home>
    ),
  };
};
