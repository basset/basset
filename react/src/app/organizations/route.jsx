import React from 'react';

import Organization from './controller.jsx';
import Home from '../Home-controller.jsx';
import { getOrganization } from '../../redux/organizations/actions';

export default async (context, params, history, dispatch, getState) => {
  await dispatch(getOrganization());
  return {
    title: `Basset • Organizations`,
    component: (
      <Home hideSidebar>
        <Organization />
      </Home>
    ),
  };
};