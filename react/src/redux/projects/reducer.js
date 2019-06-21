import createReducer from '../create-reducer.js';
import * as actionTypes from './action-types';

const initialState = {
  isLoading: false,
  isLoadingSingle: false,
  isLoadingMore: false,
  isUpdating: false,
  error: '',
  projects: [],
  total: null,
  currentProjectId: null,
  pageInfo: {
    hasNextPage: false,
  },
  locationKey: null,
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
  [actionTypes.isUpdating]: state => ({
    ...state,
    isUpdating: true,
  }),
  [actionTypes.doneUpdating]: state => ({
    ...state,
    isUpdating: false,
  }),
  [actionTypes.receiveProjects]: (state, { projects }) => ({
    ...state,
    projects: projects,
    currentProjectId: projects.length === 1 ? projects[0].id : null,
  }),
  [actionTypes.addProjects]: (state, { projects }) => ({
    ...state,
    projects: [...state.projects, ...projects],
  }),
  [actionTypes.addProject]: (state, { project }) => ({
    ...state,
    projects: [...state.projects, project],
    currentProjectId: state.currentProjectId
      ? state.currentProjectId
      : project.id,
  }),
  [actionTypes.setCurrentProject]: (state, { currentProjectId }) => ({
    ...state,
    currentProjectId,
  }),
  [actionTypes.updateProject]: (state, { project }) => ({
    ...state,
    projects: state.projects.map(p => {
      if (p.id === project.id) {
        return {
          ...p,
          ...project,
        };
      }
      return {
        ...p,
      };
    }),
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
