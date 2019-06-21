import * as actionTypes from './action-types.js';

import ApolloClient from '../../graphql/client.js';
import logoutMutation from '../../graphql/mutate/logout.js';
import editUserMutation from '../../graphql/mutate/editUser.js';

import { getProjects } from '../projects/actions.js';
import { goLogin, goHome, navigateTo } from '../router/actions.js';
import { receiveOrganizations } from '../organizations/actions.js';

export const isLoading = () => ({ type: actionTypes.isLoading });
export const doneLoading = () => ({ type: actionTypes.doneLoading });
export const isUpdating = () => ({ type: actionTypes.isUpdating });
export const doneUpdating = () => ({ type: actionTypes.doneUpdating });

export const setError = error => ({
  type: actionTypes.setError,
  error,
});

export const receiveUser = user => ({
  type: actionTypes.login,
  user,
});

export const logoutUser = () => ({ type: actionTypes.logout });

export const login = (user, redirect) => dispatch => {
  dispatch(loginUser(user));
  if (redirect) {
    navigateTo(redirect);
  } else {
    goHome();
  }
};

export const loginUser = user => async dispatch => {
  dispatch(receiveUser(user));
  dispatch(receiveOrganizations(user.organizations.edges.map(e => e.node)));
  await dispatch(getProjects());
};

export const logout = () => async dispatch => {
  await ApolloClient.mutate({
    mutation: logoutMutation,
  });
  await dispatch(logoutUser());
  goLogin();
};

export const updateUser = user => ({
  type: actionTypes.updateUser,
  user,
});

export const saveUser = user => async (dispatch, getState) => {
  dispatch(isUpdating());
  try {
    const { data } = await ApolloClient.mutate({
      mutation: editUserMutation,
      variables: {
        name: user.name,
      },
    });
    if (data.editUser) {
      dispatch(updateUser(data.editUser));
    }
    dispatch(doneUpdating());
  } catch (error) {
    dispatch(setError(error));
    dispatch(doneUpdating());
  }
};
