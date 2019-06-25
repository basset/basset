import createReducer from '../create-reducer.js';

import * as actionTypes from './action-types';

const initialState = {
  isLoading: false,
  user: {
    id: null,
    name: '',
    email: '',
    profileImage: '',
    providers: [],
    canCreateOrganizations: false,
  },
  isAuthenticated: false,
  isUpdating: false,
  error: '',
};

const handler = {
  [actionTypes.isLoading]: state => ({
    ...state,
    isLoading: true,
    error: '',
  }),
  [actionTypes.doneLoading]: state => ({
    ...state,
    isLoading: false,
  }),
  [actionTypes.isUpdating]: state => ({
    ...state,
    isUpdating: true,
    error: '',
  }),
  [actionTypes.doneUpdating]: state => ({
    ...state,
    isUpdating: false,
  }),
  [actionTypes.setError]: (state, { error }) => ({
    ...state,
    error,
  }),
  [actionTypes.login]: (state, { user }) => ({
    ...state,
    user: {
      ...state.user,
      admin: user.admin,
      email: user.email,
      id: user.id,
      lastLogin: user.lastLogin,
      name: user.name,
      canCreateOrganizations: user.canCreateOrganizations,
      profileImage: user.profileImage,
      providers: user.providers.edges.map(e => ({
        provider: e.node.provider,
      })),
    },
    isAuthenticated: true,
  }),
  [actionTypes.updateUser]: (state, { user }) => ({
    ...state,
    user: {
      ...state.user,
      admin: user.admin,
      email: user.email,
      id: user.id,
      lastLogin: user.lastLogin,
      name: user.name,
      canCreateOrganizations: user.canCreateOrganizations,
      profileImage: user.profileImage,
      providers: user.providers.edges.map(e => ({
        provider: e.node.provider,
      })),
    },
    isAuthenticated: true,
  }),
  [actionTypes.logout]: state => ({
    ...state,
    user: {
      ...initialState.user,
    },
    isAuthenticated: false,
  }),
};

export default createReducer(initialState, handler);
