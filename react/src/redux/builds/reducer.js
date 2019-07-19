import createReducer from '../create-reducer.js';

import * as actionTypes from './action-types';

const initialState = {
  isLoading: false,
  isLoadingSingle: false,
  isLoadingMore: false,
  error: '',
  builds: [],
  pageInfo: {
    hasNextPage: false,
  },
  currentBuildId: null,
  currentCursor: null,
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
  [actionTypes.isLoadingSingle]: state => ({
    ...state,
    isLoadingSingle: true,
  }),
  [actionTypes.doneLoadingSingle]: state => ({
    ...state,
    isLoadingSingle: false,
  }),
  [actionTypes.isLoadingMore]: state => ({
    ...state,
    isLoadingMore: true,
  }),
  [actionTypes.doneLoadingMore]: state => ({
    ...state,
    isLoadingMore: false,
  }),
  [actionTypes.setError]: (state, { error }) => ({
    ...state,
    error,
  }),
  [actionTypes.receiveBuilds]: (state, { builds }) => ({
    ...state,
    builds,
  }),
  [actionTypes.clearBuilds]: state => ({
    ...state,
    builds: [],
    currentBuildId: null,
    pageInfo: {
      hasNextPage: false,
    },
  }),
  [actionTypes.addBuild]: (state, { build }) => ({
    ...state,
    builds: [...state.builds, build],
  }),
  [actionTypes.addBuilds]: (state, { builds }) => ({
    ...state,
    builds: [...state.builds, ...builds],
  }),
  [actionTypes.updateBuild]: (state, { build }) => ({
    ...state,
    builds: state.builds.map(b => {
      if (b.id === build.id) {
        return {
          ...b,
          ...build,
        };
      }
      return {
        ...b,
      };
    }),
  }),
  [actionTypes.setCurrentBuild]: (state, { currentBuildId }) => ({
    ...state,
    currentBuildId,
  }),
  [actionTypes.updatePageInfo]: (state, { data }) => ({
    ...state,
    pageInfo: {
      ...state.pageInfo,
      hasNextPage: data.pageInfo.hasNextPage,
    },
    currentCursor:
      data.edges.length > 0 ? data.edges[data.edges.length - 1].cursor : null,
  }),
  [actionTypes.setLocationKey]: (state, { locationKey }) => ({
    ...state,
    locationKey,
  }),
};

export default createReducer(initialState, handler);
