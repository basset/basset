import React from 'react';

import { getSnapshot } from '../../../redux/snapshots/actions.js';

import Home from '../../Home-controller.jsx';
import Snapshot from './controller.jsx';

export default (context, params, history, dispatch, getState) => {
  const id = params.id;
  dispatch(getSnapshot(id));
  return {
    title: 'Basset • Snapshot',
    component: (
      <Home hideSidebar>
        <Snapshot />
      </Home>
    ),
  };
};
