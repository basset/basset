import ApolloClient from '../../graphql/client.js';
import getProjectsQuery from '../../graphql/query/getProjects.js';
import getProjectQuery from '../../graphql/query/getProject.js';
import linkProviderToProjectMutation from '../../graphql/mutate/linkProviderToProject.js';
import unlinkProviderToProjectMutation from '../../graphql/mutate/unlinkProviderToProject.js';
import editProjectMutation from '../../graphql/mutate/editProject.js';
import { setCurrentOrganization } from '../organizations/actions';

import { changeOrganization } from '../organizations/actions.js';
import { getBuilds, setCurrentBuild, clearBuilds } from '../builds/actions.js';
import { getUser } from '../user/selectors.js';
import * as actionTypes from './action-types.js';

export const setError = error => ({
  type: actionTypes.setError,
  error,
});

export const isLoading = () => ({ type: actionTypes.isLoading });
export const doneLoading = () => ({ type: actionTypes.doneLoading });
export const isLoadingSingle = () => ({ type: actionTypes.isLoadingSingle });
export const doneLoadingSingle = () => ({
  type: actionTypes.doneLoadingSingle,
});
export const isLoadingMore = () => ({ type: actionTypes.isLoadingMore });
export const doneLoadingMore = () => ({ type: actionTypes.doneLoadingMore });

export const isUpdating = () => ({ type: actionTypes.isUpdating });
export const doneUpdating = () => ({ type: actionTypes.doneUpdating });

export const receiveProjects = projects => ({
  type: actionTypes.receiveProjects,
  projects,
});

export const addProjects = projects => ({
  type: actionTypes.addProjects,
  projects,
});

export const updatePageInfo = data => ({
  type: actionTypes.updatePageInfo,
  data,
});

export const getProject = id => async (dispatch, getState) => {
  const { currentOrganizationId } = getState().organizations;
  const { projects } = getState().projects;
  try {
    dispatch(isLoadingSingle());
    const { data } = await ApolloClient.query({
      query: getProjectQuery,
      variables: {
        id,
      },
    });
    if (data.project) {
      const { project } = data;
      dispatch(setCurrentProject(id));
      if (projects.length === 0) {
        await dispatch(addProject(project));
        await dispatch(setCurrentOrganization(project.organizationId));
        await dispatch(getBuilds());
      }
      if (currentOrganizationId !== project.organizationId) {
        await dispatch(changeOrganization({ id: project.organizationId }));
      }
    }
    dispatch(doneLoadingSingle());
  } catch (error) {
    dispatch(doneLoadingSingle());
  }
};

export const getProjects = () => async (dispatch, getState) => {
  const { currentOrganizationId } = getState().organizations;
  if (!currentOrganizationId) {
    return;
  }

  try {
    dispatch(isLoading());
    const { data } = await ApolloClient.query({
      query: getProjectsQuery,
      variables: {
        organizationId: currentOrganizationId,
        first: 100,
      },
    });
    if (data.projects) {
      const projects = data.projects.edges.map(e => e.node);
      dispatch(receiveProjects(projects));
      dispatch(clearBuilds());
      dispatch(updatePageInfo(data.projects));
    }
    dispatch(doneLoading());
  } catch (error) {
    dispatch(doneLoading());
  }
};

export const addProject = project => ({
  type: actionTypes.addProject,
  project,
});

export const setCurrentProject = currentProjectId => ({
  type: actionTypes.setCurrentProject,
  currentProjectId,
});

export const changeProject = ({ id }) => async (dispatch, getState) => {
  const state = getState();
  const { currentProjectId } = state.projects;
  const { currentOrganizationId } = state.organizations;
  if (id !== currentProjectId) {
    const project = state.projects.projects.find(p => p.id === id);
    if (project) {
      dispatch(setCurrentProject(id));
    } else {
      await dispatch(getProject(id));
    }
  }

  await dispatch(getBuilds());
};

export const linkProjectToProvider = (projectId, provider) => async (
  dispatch,
  getState,
) => {
  dispatch(isUpdating());
  try {
    const { data } = await ApolloClient.mutate({
      mutation: linkProviderToProjectMutation,
      variables: {
        id: projectId,
        provider,
      },
    });

    if (data.linkProviderToProject) {
      dispatch(updateProject(data.linkProviderToProject));
    }
    dispatch(doneUpdating());
  } catch (error) {
    dispatch(setError(error));
    dispatch(doneUpdating());
  }
};

export const linkToProvider = provider => async (dispatch, getState) => {
  const state = getState();
  const { currentProjectId } = state.projects;
  const user = getUser(state);
  const hasProvider = user.providers.some(p => p.provider === provider);
  if (hasProvider) {
    dispatch(linkProjectToProvider(currentProjectId, provider));
  } else {
    window.location.href = `/oauth/${provider}`;
  }
};

export const updateProject = project => ({
  type: actionTypes.updateProject,
  project,
});

export const saveProject = project => async (dispatch, getState) => {
  const state = getState();
  const { currentProjectId } = state.projects;
  dispatch(isUpdating());
  try {
    const { data } = await ApolloClient.mutate({
      mutation: editProjectMutation,
      variables: {
        id: currentProjectId,
        projectInput: {
          ...project,
        },
      },
    });
    if (data.editProject) {
      dispatch(updateProject(data.editProject));
    }
    dispatch(doneUpdating());
  } catch (error) {
    dispatch(setError(error));
    dispatch(doneUpdating());
  }
};

export const removeCurrentProvider = () => async (dispatch, getState) => {
  const state = getState();
  const { currentProjectId } = state.projects;
  dispatch(isUpdating());
  try {
    const { data } = await ApolloClient.mutate({
      mutation: unlinkProviderToProjectMutation,
      variables: {
        id: currentProjectId,
      },
    });
    if (data.unlinkProviderToProject) {
      dispatch(updateProject(data.unlinkProviderToProject));
    }
    dispatch(doneUpdating());
  } catch (error) {
    dispatch(setError(error));
    dispatch(doneUpdating());
  }
};

export const loadMore = () => async (dispatch, getState) => {
  const state = getState();
  const { currentCursor } = state.projects;
  const { currentOrganizationId } = state.organizations;
  if (!currentOrganizationId) {
    return;
  }
  try {
    dispatch(isLoadingMore());
    const { data } = await ApolloClient.query({
      query: getProjectsQuery,
      variables: {
        organizationId: currentOrganizationId,
        first: 100,
        after: currentCursor,
      },
    });
    if (data.projects) {
      const projects = data.projects.edges.map(e => e.node);
      await dispatch(addProjects(projects));
      await dispatch(updatePageInfo(data.projects));
    }
    dispatch(doneLoadingMore());
  } catch (error) {
    dispatch(doneLoadingMore());
  }
};

export const setLocationKey = locationKey => ({
  type: actionTypes.setLocationKey,
  locationKey,
});

export const checkLocationKey = key => (dispatch, getState) => {
  dispatch(isLoading());
  const { locationKey } = getState().projects;
  if (locationKey !== key) {
    dispatch(setCurrentBuild(null));
    dispatch(setLocationKey(key));
  }
  dispatch(doneLoading());
};
