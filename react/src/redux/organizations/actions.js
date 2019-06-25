import ApolloClient from '../../graphql/client.js';
import editOrganizationMutation from '../../graphql/mutate/editOrganization.js';

import { getProjects } from '../projects/actions.js';
import { getCurrentOrganization } from './selectors.js';
import { goHome } from '../router/actions.js';
import * as actionTypes from './action-types.js';

export const isLoading = () => ({ type: actionTypes.isLoading });
export const doneLoading = () => ({ type: actionTypes.doneLoading });
export const isUpdating = () => ({ type: actionTypes.isUpdating });
export const doneUpdating = () => ({ type: actionTypes.doneUpdating });
export const removeOrganization = organization => ({
  type: actionTypes.removeOrganization,
  organization,
});

export const updateOrganization = organization => ({
  type: actionTypes.updateOrganization,
  organization,
});

export const setError = error => ({
  type: actionTypes.setError,
  error,
});

export const receiveOrganizations = organizations => ({
  type: actionTypes.receiveOrganizations,
  organizations,
});

export const setCurrentOrganization = currentOrganizationId => ({
  type: actionTypes.setCurrentOrganization,
  currentOrganizationId,
});

export const changeOrganization = ({ id }) => async (dispatch, getState) => {
  const { currentOrganizationId } = getState().organizations;
  await ApolloClient.resetStore();
  if (id !== currentOrganizationId) {
    dispatch(isLoading());
    dispatch(setCurrentOrganization(id));
    await dispatch(getProjects());
    goHome();
    dispatch(doneLoading());
  }
};

export const addOrganization = organization => ({
  type: actionTypes.addOrganization,
  organization,
});

export const leaveCurrentOrganization = () => (dispatch, getState) => {
  const state = getState();
  const organization = getCurrentOrganization(state);
  dispatch(removeOrganization(organization));
};

export const saveOrganization = ({ name }) => async (dispatch, getState) => {
  const state = getState();
  const organization = getCurrentOrganization(state);
  dispatch(isUpdating());
  try {
    const { data } = await ApolloClient.mutate({
      mutation: editOrganizationMutation,
      variables: {
        id: organization.id,
        name: name,
      },
    });
    if (data.editOrganization) {
      dispatch(updateOrganization(data.editOrganization));
    }
    dispatch(doneUpdating());
  } catch (error) {
    dispatch(setError(error));
    dispatch(doneUpdating());
  }
};
