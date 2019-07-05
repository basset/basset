import React from 'react';

import { getIsAuthenticated, getUser } from '../../redux/user/selectors.js';
import { verify } from '../verify-authenticated.js';

import Invite from './controller.jsx';

export default async (context, params, history, dispatch, getState) => {
  let isAuthenticated = getIsAuthenticated(getState());
  let user = null;
  if (!isAuthenticated) {
    await dispatch(verify());
    isAuthenticated = getIsAuthenticated(getState());
  }
  if (isAuthenticated) {
    user = getUser(getState());
  }
  return {
    title: 'Basset • Invite',
    component: (
      <Invite
        user={user}
        isAuthenticated={isAuthenticated}
        id={params.id}
        token={params.token}
      />
    ),
  };
};
