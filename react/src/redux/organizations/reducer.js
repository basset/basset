import createReducer from '../create-reducer.js';

import * as actionTypes from './action-types';

const initialState = {
  isLoading: false,
  isUpdating: false,
  error: '',
  organizations: [],
  total: null,
  currentOrganizationId: null,
};

const handler = {
  [actionTypes.isLoading]: state => ({
    ...state,
    isLoading: true,
  }),
  [actionTypes.doneLoading]: state => ({
    ...state,
    isLoading: false,
  }),
  [actionTypes.isUpdating]: state => ({
    ...state,
    isUpdating: true,
  }),
  [actionTypes.doneUpdating]: state => ({
    ...state,
    isUpdating: false,
  }),
  [actionTypes.setError]: (state, { error }) => ({
    ...state,
    error,
  }),
  [actionTypes.receiveOrganizations]: (state, { organizations }) => ({
    ...state,
    organizations: organizations,
    currentOrganizationId:
      organizations.length > 0 ? organizations[0].id : null,
  }),
  [actionTypes.setCurrentOrganization]: (state, { currentOrganizationId }) => ({
    ...state,
    currentOrganizationId,
  }),
  [actionTypes.addOrganization]: (state, { organization }) => ({
    ...state,
    organizations: [...state.organizations, organization],
    currentOrganizationId: state.currentOrganizationId
      ? state.currentOrganizationId
      : organization.id,
  }),
  [actionTypes.removeOrganization]: (state, { organization }) => {
    const organizations = state.organizations.filter(
      org => org.id !== organization.id,
    );
    let currentOrganizationId = null;
    if (
      (state.currentOrganizationId === organization.id ||
        state.currentOrganizationId === null) &&
      organizations.length > 0
    ) {
      currentOrganizationId = organizations[0].id;
    }
    return {
      ...state,
      organizations,
      currentOrganizationId,
    };
  },
  [actionTypes.updateOrganization]: (state, { organization }) => {
    return {
      ...state,
      organizations: state.organizations.map(org => {
        if (org.id === organization.id) {
          return {
            ...org,
            ...organization,
          };
        }
        return {
          ...org,
        };
      }),
    };
  },
};

export default createReducer(initialState, handler);
