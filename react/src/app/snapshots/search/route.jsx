import React from 'react';

import { getSnapshotsByTitle } from '../../../redux/snapshots/actions.js';

import Home from '../../Home-controller.jsx';
import Snapshot from './controller.jsx';

export default (context, params, history, dispatch, getState) => {
  const title = params.title;
  const projectId = params.projectId;
  console.log(context)
  console.log(params)
  dispatch(getSnapshotsByTitle(projectId, title));
  return {
    title: 'Basset • Snapshot',
    component: (
      <Home hideSidebar>
        <Snapshot />
      </Home>
    ),
  };
};
