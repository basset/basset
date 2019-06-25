import React from 'react';

import { changeBuild, checkLocationKey } from '../../redux/builds/actions.js';
import { getCurrentBuild } from '../../redux/builds/selectors.js';

import Build from './controller.jsx';
import Home from '../Home-controller.jsx';
import {
  setCurrentSnapshot,
  isLoading,
  doneLoading,
} from '../../redux/snapshots/actions.js';

export default async (context, params, history, dispatch, getState) => {
  let currentBuild = getCurrentBuild(getState());
  if (!params.snapshotId) {
    dispatch(isLoading('single'));
    dispatch(checkLocationKey(history.location.key));
    dispatch(doneLoading('single'));
  } else {
    dispatch(setCurrentSnapshot(params.snapshotId));
  }
  const id = params.id;

  if (currentBuild === undefined || currentBuild.id !== id) {
    await dispatch(changeBuild({ id }));
    currentBuild = getCurrentBuild(getState());
  }
  return {
    title: `Basset • Build #${currentBuild.number}`,
    component: (
      <Home hideSidebar>
        <Build />
      </Home>
    ),
  };
};
