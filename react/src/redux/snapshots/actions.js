import ApolloClient from '../../graphql/client.js';
import getSnapshotsQuery from '../../graphql/query/getSnapshots.js';
import getSnapshotGroupsQuery from '../../graphql/query/getSnapshotGroups.js';
import getSnapshotsFromGroupQuery from '../../graphql/query/getSnapshotsFromGroup.js';
import getSnapshotQuery from '../../graphql/query/getSnapshot.js';
import getSnapshotsByTitleQuery from '../../graphql/query/getSnapshotsByTitle.js';
import approveSnapshotMutation from '../../graphql/mutate/approveSnapshot.js';
import approveAllSnapshotsMutation from '../../graphql/mutate/approveAllSnapshots.js';
import addSnapshotFlakeMutation from '../../graphql/mutate/addSnapshotFlake.js';
import approveGroupSnapshotsMutation from '../../graphql/mutate/approveGroupSnapshots';

import { navigateTo } from '../router/actions.js';
import { changeOrganization } from '../organizations/actions.js';
import { changeProject } from '../projects/actions.js';
import { changeBuild, updateApprovedSnapshots } from '../builds/actions.js';
import { getUser } from '../user/selectors.js';
import * as actionTypes from './action-types.js';

export const isLoading = snapshotType => ({
  type: actionTypes.isLoading,
  snapshotType,
});
export const doneLoading = snapshotType => ({
  type: actionTypes.doneLoading,
  snapshotType,
});
export const isLoadingMore = snapshotType => ({
  type: actionTypes.isLoadingMore,
  snapshotType,
});
export const doneLoadingMore = snapshotType => ({
  type: actionTypes.doneLoadingMore,
  snapshotType,
});
export const isLoadingMoreFromGroup = group => ({
  type: actionTypes.isLoadingMoreFromGroup,
  group,
});
export const doneLoadingMoreFromGroup = group => ({
  type: actionTypes.doneLoadingMoreFromGroup,
  group,
});

export const isApproving = () => ({ type: actionTypes.isApproving });
export const doneApproving = () => ({ type: actionTypes.doneApproving });
export const isLoadingGroups = () => ({ type: actionTypes.isLoadingGroups });
export const doneLoadingGroups = () => ({
  type: actionTypes.doneLoadingGroups,
});
export const isLoadingMoreGroups = () => ({
  type: actionTypes.isLoadingMoreGroups,
});
export const doneLoadingMoreGroups = () => ({
  type: actionTypes.doneLoadingMoreGroups,
});
export const isAddingSnapshotFlake = () => ({
  type: actionTypes.isAddingSnapshotFlake,
});
export const doneAddingSnapshotFlake = () => ({
  type: actionTypes.doneAddingSnapshotFlake,
});

export const setError = error => ({
  type: actionTypes.setError,
  error,
});

export const receiveGroups = groups => ({
  type: actionTypes.receiveGroups,
  groups,
});

export const addGroups = groups => ({
  type: actionTypes.addGroups,
  groups,
});

export const updateGroupsPageInfo = groups => ({
  type: actionTypes.updateGroupsPageInfo,
  groups,
});

export const addSnapshotsToGroup = (group, snapshots) => ({
  type: actionTypes.addSnapshotsToGroup,
  group,
  snapshots,
});

export const updateGroupSnapshotsPageInfo = (group, pageInfo) => ({
  type: actionTypes.updateGroupSnapshotsPageInfo,
  group,
  pageInfo,
});

export const showMoreFromGroup = group => ({
  type: actionTypes.showMoreFromGroup,
  group,
});

export const receiveSnapshots = (snapshotType, snapshots) => ({
  type: actionTypes.receiveSnapshots,
  snapshots,
  snapshotType,
});

export const addSnapshot = (snapshotType, snapshot) => ({
  type: actionTypes.addSnapshot,
  snapshot,
  snapshotType,
});

export const addSnapshots = (snapshotType, snapshots) => ({
  type: actionTypes.addSnapshots,
  snapshots,
  snapshotType,
});

export const approveSnapshots = snapshot => ({
  type: actionTypes.approveSnapshots,
  snapshot,
});

export const updateGroupSnapshot = (group, snapshot) => ({
  type: actionTypes.updateGroupSnapshot,
  group,
  snapshot,
});

export const updateGroupSnapshots = (group, snapshot) => ({
  type: actionTypes.updateGroupSnapshots,
  group,
  snapshot,
});

export const updateGroupApprovedSnapshots = (group, approvedSnapshots) => ({
  type: actionTypes.updateGroupApprovedSnapshots,
  group,
  approvedSnapshots,
});

export const updatePageInfo = (snapshotType, data) => ({
  type: actionTypes.updatePageInfo,
  data,
  snapshotType,
});

export const clearSnapshots = () => ({
  type: actionTypes.clearSnapshots,
});

export const updateSnapshot = (snapshotType, snapshot) => ({
  type: actionTypes.updateSnapshot,
  snapshot,
  snapshotType,
});

export const getSnapshotsByTitle = (projectId, title, width, browser) => async (dispatch, getState) => {
  const type = 'search';
  dispatch(isLoading(type));
  try {
    const { data } = await ApolloClient.query({
      query: getSnapshotsByTitleQuery,
      variables: {
        title,
        first: 100,
        width,
        browser,
        projectId: projectId,
      },
    });
    if (data.snapshotsByTitle) {
      dispatch(receiveSnapshots(type, data.snapshotsByTitle.edges.map(e => e.node)));
      dispatch(updatePageInfo(type, data.snapshotsByTitle));
    }
    dispatch(doneLoading(type));
  } catch (error) {
    dispatch(doneLoading(type));
  }
}

export const getSnapshot = id => async (dispatch, getState) => {
  const state = getState();
  const { currentOrganizationId } = state.organizations;
  const { currentProjectId } = state.projects;
  const { currentBuildId } = state.builds;
  const { snapshots } = state.snapshots;

  dispatch(isLoading('single'));
  try {
    const { data } = await ApolloClient.query({
      query: getSnapshotQuery,
      variables: {
        id,
      },
    });
    const snapshot = data.snapshot;
    if (snapshot) {
      if (snapshots.single.find(s => s.id === snapshot.id)) {
        dispatch(updateSnapshot('single', snapshot));
      } else {
        dispatch(addSnapshot('single', snapshot));
      }
      if (currentOrganizationId !== snapshot.organizationId) {
        dispatch(changeOrganization({ id: snapshot.organizationId }));
      }
      if (currentProjectId !== snapshot.projectId) {
        dispatch(changeProject({ id: snapshot.projectId }));
      }
      if (currentBuildId !== snapshot.buildId) {
        dispatch(changeBuild({ id: snapshot.buildId }));
      }
      dispatch(setCurrentSnapshot(snapshot.id));
    }
    dispatch(doneLoading('single'));
  } catch (error) {
    dispatch(doneLoading('single'));
  }
};

export const getSnapshots = type => async (dispatch, getState) => {
  const state = getState();
  const { currentBuildId } = state.builds;
  if (!currentBuildId) {
    return;
  }
  dispatch(isLoading(type));
  try {
    const { data } = await ApolloClient.query({
      query: getSnapshotsQuery,
      variables: {
        buildId: currentBuildId,
        first: 25,
        type: type.toUpperCase(),
      },
    });

    if (data.snapshots) {
      dispatch(receiveSnapshots(type, data.snapshots.edges.map(e => e.node)));
      dispatch(updatePageInfo(type, data.snapshots));
    }
    dispatch(doneLoading(type));
  } catch (error) {
    dispatch(doneLoading(type));
  }
};

export const getSnapshotGroups = () => async (dispatch, getState) => {
  const state = getState();
  const { currentBuildId } = state.builds;
  if (!currentBuildId) {
    return;
  }
  dispatch(isLoadingGroups());
  try {
    const { data } = await ApolloClient.query({
      query: getSnapshotGroupsQuery,
      variables: {
        buildId: currentBuildId,
        limit: 25,
        offset: 0,
        first: 25,
      },
    });

    if (data.modifiedSnapshotGroups) {
      dispatch(
        receiveGroups(data.modifiedSnapshotGroups.edges.map(e => e.node)),
      );
      dispatch(updateGroupsPageInfo(data.modifiedSnapshotGroups));
    }
    dispatch(doneLoadingGroups());
  } catch (error) {
    dispatch(doneLoadingGroups());
  }
};

export const loadMoreGroups = () => async (dispatch, getState) => {
  const state = getState();
  const { currentBuildId } = state.builds;
  if (!currentBuildId) {
    return;
  }
  dispatch(isLoadingMoreGroups());
  try {
    const { data } = await ApolloClient.query({
      query: getSnapshotGroupsQuery,
      variables: {
        buildId: currentBuildId,
        limit: 25,
        offset: state.snapshots.groups.length,
        first: 25,
      },
    });

    if (data.modifiedSnapshotGroups) {
      dispatch(addGroups(data.modifiedSnapshotGroups.edges.map(e => e.node)));
      dispatch(updateGroupsPageInfo(data.modifiedSnapshotGroups));
    }
    dispatch(doneLoadingMoreGroups());
  } catch (error) {
    dispatch(doneLoadingMoreGroups());
  }
};

export const loadMoreFromGroup = group => async (dispatch, getState) => {
  const state = getState();
  const { currentBuildId } = state.builds;
  const after = group.snapshots.edges.slice(-1)[0].cursor;
  if (!currentBuildId) {
    return;
  }
  dispatch(isLoadingMoreFromGroup(group.group));
  try {
    const { data } = await ApolloClient.query({
      query: getSnapshotsFromGroupQuery,
      variables: {
        group: group.group,
        buildId: currentBuildId,
        first: 25,
        after: after,
      },
    });

    if (data.modifiedSnapshots) {
      dispatch(addSnapshotsToGroup(group, data.modifiedSnapshots.edges));
      dispatch(
        updateGroupSnapshotsPageInfo(group, data.modifiedSnapshots.pageInfo),
      );
    }
    dispatch(doneLoadingMoreFromGroup(group.group));
  } catch (error) {
    dispatch(doneLoadingMoreFromGroup(group.group));
  }
};

export const setCurrentSnapshot = currentSnapshotId => ({
  type: actionTypes.setCurrentSnapshot,
  currentSnapshotId,
});

export const changeSnapshot = ({ id }) => (dispatch, getState) => {
  const { currentSnapshotId } = getState().snapshots;
  if (id !== currentSnapshotId) {
    dispatch(setCurrentSnapshot(id));
  }
};
export const showSnapshot = ({ id }) => dispatch => {
  dispatch(changeSnapshot(id));
  navigateTo(`/snapshots/${id}`);
};

export const showSnapshots = buildId => (dispatch, getState) => {
  navigateTo(`/builds/${buildId}`);
};

export const approveSnapshot = ({ group, snapshot }) => async dispatch => {
  dispatch(isApproving());
  try {
    const { data } = await ApolloClient.mutate({
      mutation: approveSnapshotMutation,
      variables: {
        snapshotId: snapshot.id,
      },
    });
    if (data.approveSnapshot) {
      dispatch(updateGroupSnapshot(group, data.approveSnapshot));
      dispatch(
        updateGroupApprovedSnapshots(group, group.approvedSnapshots + 1),
      );
      dispatch(updateApprovedSnapshots(1));
    }
    dispatch(doneApproving());
  } catch (error) {
    dispatch(doneApproving());
  }
};

export const approveAllSnapshots = () => async (dispatch, getState) => {
  const state = getState();
  const user = getUser(state);
  const { currentBuildId } = state.builds;
  if (!currentBuildId) {
    return;
  }
  dispatch(isApproving());
  try {
    const { data } = await ApolloClient.mutate({
      mutation: approveAllSnapshotsMutation,
      variables: {
        buildId: currentBuildId,
      },
    });
    if (data.approveSnapshots) {
      dispatch(
        approveSnapshots({
          approved: true,
          approvedBy: {
            user,
          },
          approvedOn: new Date().getTime(),
        }),
      );
      dispatch(updateApprovedSnapshots(-1));
    }
    dispatch(doneApproving());
  } catch (error) {
    dispatch(doneApproving());
  }
};

export const approveGroupSnapshots = group => async (dispatch, getState) => {
  const state = getState();
  const user = getUser(state);
  const { currentBuildId } = state.builds;
  if (!currentBuildId) {
    return;
  }
  dispatch(isApproving());
  try {
    const { data } = await ApolloClient.mutate({
      mutation: approveGroupSnapshotsMutation,
      variables: {
        buildId: currentBuildId,
        group: group.group,
      },
    });
    if (data.approveGroupSnapshots) {
      dispatch(
        updateGroupSnapshots(group, {
          approved: true,
          approvedBy: {
            user,
          },
          approvedOn: new Date().getTime(),
        }),
      );
      dispatch(updateGroupApprovedSnapshots(group, group.snapshots.totalCount));
      dispatch(updateApprovedSnapshots(group.snapshots.totalCount));
    }
    dispatch(doneApproving());
  } catch (error) {
    dispatch(doneApproving());
  }
};

export const loadMore = type => async (dispatch, getState) => {
  const state = getState();
  const { currentBuildId } = state.builds;
  const currentCursor = state.snapshots.currentCursor[type];
  if (!currentBuildId) {
    return;
  }
  dispatch(isLoadingMore(type));
  try {
    const { data } = await ApolloClient.query({
      query: getSnapshotsQuery,
      variables: {
        buildId: currentBuildId,
        first: 25,
        after: currentCursor,
        type: type.toUpperCase(),
      },
    });
    if (data.snapshots) {
      dispatch(addSnapshots(type, data.snapshots.edges.map(e => e.node)));
      dispatch(updatePageInfo(type, data.snapshots));
    }
    dispatch(doneLoadingMore(type));
  } catch (error) {
    dispatch(doneLoadingMore(type));
  }
};

export const addSnapshotFlake = ({ group, snapshot }) => async (
  dispatch,
  getState,
) => {
  dispatch(isAddingSnapshotFlake());
  try {
    const { data } = await ApolloClient.mutate({
      mutation: addSnapshotFlakeMutation,
      variables: {
        id: snapshot.id,
      },
    });
    if (data.addSnapshotFlake) {
      dispatch(
        updateGroupSnapshot(group, {
          id: snapshot.id,
          snapshotFlake: data.addSnapshotFlake,
        }),
      );
    }
    dispatch(doneAddingSnapshotFlake());
  } catch (error) {
    dispatch(doneAddingSnapshotFlake());
  }
};
