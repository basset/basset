import ApolloClient from '../../graphql/client.js';
import getBuildsQuery from '../../graphql/query/getBuilds.js';
import getBuildQuery from '../../graphql/query/getBuild.js';

import { changeOrganization } from '../organizations/actions.js';
import { changeProject } from '../projects/actions.js';
import {
  getSnapshots,
  setCurrentSnapshot,
  clearSnapshots,
  getSnapshotGroups,
} from '../snapshots/actions.js';
import { getCurrentBuild } from './selectors.js';
import * as actionTypes from './action-types.js';

export const isLoading = () => ({ type: actionTypes.isLoading });
export const doneLoading = () => ({ type: actionTypes.doneLoading });
export const isLoadingSingle = () => ({ type: actionTypes.isLoadingSingle });
export const doneLoadingSingle = () => ({
  type: actionTypes.doneLoadingSingle,
});
export const isLoadingMore = () => ({ type: actionTypes.isLoadingMore });
export const doneLoadingMore = () => ({ type: actionTypes.doneLoadingMore });

export const setError = error => ({
  type: actionTypes.setError,
  error,
});

export const receiveBuilds = builds => ({
  type: actionTypes.receiveBuilds,
  builds,
});

export const clearBuilds = builds => ({
  type: actionTypes.clearBuilds,
  builds,
});

export const updateBuild = build => ({
  type: actionTypes.updateBuild,
  build,
});

export const addBuild = build => ({
  type: actionTypes.addBuild,
  build,
});

export const addBuilds = builds => ({
  type: actionTypes.addBuilds,
  builds,
});

export const updatePageInfo = data => ({
  type: actionTypes.updatePageInfo,
  data,
});

export const updateBuilds = builds => ({
  type: actionTypes.updateBuilds,
  builds,
});

export const setTimerId = timerId => ({
  type: actionTypes.setTimerId,
  timerId,
});

export const startPolling = () => dispatch => {
  const timer = setInterval(
    () => dispatch(poll()),
    5000
  );
  dispatch(setTimerId(timer));
};

export const stopPolling = () => (dispatch, getState) => {
  const timerId = getState().builds.timerId;
  if (timerId !== null) {
    clearInterval(timerId);
    dispatch(setTimerId(null));
  }
};

export const getBuilds = () => async (dispatch, getState) => {
  const state = getState();
  const { currentOrganizationId } = state.organizations;
  const { currentProjectId } = state.projects;
  if (!currentOrganizationId || !currentProjectId) {
    return;
  }
  dispatch(isLoading());
  try {
    const { data } = await ApolloClient.query({
      query: getBuildsQuery,
      variables: {
        organizationId: currentOrganizationId,
        projectId: currentProjectId,
        first: 25,
      },
    });
    if (data.builds) {
      dispatch(receiveBuilds(data.builds.edges.map(e => e.node)));
      dispatch(updatePageInfo(data.builds));
    }
    dispatch(doneLoading());
  } catch (error) {
    dispatch(setError(error));
    dispatch(doneLoading());
  }
};

export const getBuild = id => async (dispatch, getState) => {
  dispatch(isLoadingSingle());
  try {
    const { data } = await ApolloClient.query({
      query: getBuildQuery,
      variables: {
        id,
      },
    });
    const { build } = data;
    if (build) {
      const { currentOrganizationId } = getState().organizations;
      const { currentBuildId } = getState().builds;
      if (currentBuildId !== null) {
        dispatch(setCurrentSnapshot(null));
      }
      if (!currentOrganizationId) {
        await dispatch(changeOrganization({ id: build.organizationId }));
      }
      const { currentProjectId } = getState().projects;
      if (!currentProjectId || currentProjectId !== build.projectId) {
        await dispatch(changeProject({ id: build.projectId }));
      }

      dispatch(setCurrentBuild(build.id));
      dispatch(clearSnapshots());
      const { builds } = getState().builds;
      if (builds.find(b => b.id === build.id)) {
        dispatch(updateBuild(build));
      } else {
        dispatch(addBuild(build));
      }
      await Promise.all([
        dispatch(getSnapshotGroups()),
        //dispatch(getSnapshots('modified')),
        dispatch(getSnapshots('new')),
      ]);
    }
    dispatch(doneLoadingSingle());
  } catch (error) {
    dispatch(setError(error));
    dispatch(doneLoadingSingle());
  }
};

export const setCurrentBuild = currentBuildId => ({
  type: actionTypes.setCurrentBuild,
  currentBuildId,
});

export const changeBuild = ({ id }) => async (dispatch, getState) => {
  const { currentBuildId } = getState().builds;
  if (id !== currentBuildId) {
    await dispatch(getBuild(id));
  }
};

export const updateApprovedSnapshots = approved => async (
  dispatch,
  getState,
) => {
  const build = getCurrentBuild(getState());
  let approvedSnapshots =
    approved === -1
      ? build.modifiedSnapshots
      : build.approvedSnapshots + approved;
  if (approvedSnapshots > build.modifiedSnapshots) {
    approvedSnapshots = build.modifiedSnapshots;
  }
  dispatch(
    updateBuild({
      ...build,
      approvedSnapshots,
    }),
  );
};

export const loadMore = () => async (dispatch, getState) => {
  const state = getState();
  const { currentOrganizationId } = state.organizations;
  const { currentProjectId } = state.projects;
  const { currentCursor } = state.builds;
  if (!currentOrganizationId || !currentProjectId) {
    return;
  }
  dispatch(isLoadingMore());
  try {
    const { data } = await ApolloClient.query({
      query: getBuildsQuery,
      variables: {
        organizationId: currentOrganizationId,
        projectId: currentProjectId,
        first: 25,
        before: currentCursor,
      },
    });
    if (data.builds) {
      dispatch(addBuilds(data.builds.edges.map(e => e.node)));
      dispatch(updatePageInfo(data.builds));
    }
    dispatch(doneLoadingMore());
  } catch (error) {
    dispatch(doneLoadingMore());
  }
};

export const poll = () => async (dispatch, getState) => {
  const state = getState();
  const { currentOrganizationId } = state.organizations;
  const { currentProjectId } = state.projects;
  const { builds } = state.builds;
  if (!currentOrganizationId || !currentProjectId) {
    return;
  }
  const maxBuilds = builds.length > 100 ? 100 : builds.length;
  try {
    const { data } = await ApolloClient.query({
      query: getBuildsQuery,
      variables: {
        organizationId: currentOrganizationId,
        projectId: currentProjectId,
        first: maxBuilds > 25 ? maxBuilds : 25,
      },
    });
    if (data.builds && data.builds.edges.length > 0) {
      dispatch(updateBuilds(data.builds.edges.map(e => e.node)));
    }
  } catch (error) {
    dispatch(setError(error));
  }
}

export const setLocationKey = locationKey => ({
  type: actionTypes.setLocationKey,
  locationKey,
});

export const checkLocationKey = key => (dispatch, getState) => {
  dispatch(isLoading());
  const { locationKey } = getState().builds;
  if (locationKey !== key) {
    dispatch(setCurrentSnapshot(null));
    dispatch(setLocationKey(key));
  }
  dispatch(doneLoading());
};
