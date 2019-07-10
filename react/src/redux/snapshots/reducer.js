import createReducer from '../create-reducer.js';
import * as actionTypes from './action-types';

const initialState = {
  isLoading: {
    flake: false,
    new: false,
    unmodified: false,
    removed: false,
  },
  isLoadingGroups: false,
  isLoadingMore: {
    flake: false,
    new: false,
    unmodified: false,
    removed: false,
  },
  pageInfo: {
    flake: {
      hasNextPage: false,
    },
    new: {
      hasNextPage: false,
    },
    unmodified: {
      hasNextPage: false,
    },
    removed: {
      hasNextPage: false,
    },
    groups: [],
  },
  isApproving: false,
  currentCursor: {
    flake: null,
    new: null,
    unmodified: null,
    removed: null,
  },
  error: '',
  groups: [],
  groupsPageInfo: {},
  snapshots: {
    flake: [],
    single: [],
    new: [],
    unmodified: [],
    removed: [],
    search: [],
  },
  isAddingSnapshotFlake: false,
  isLoadingMoreGroups: false,
  isLoadingMoreFromGroup: {},
  showMoreFromGroup: {},
  currentSnapshotId: null,
};

const handler = {
  [actionTypes.isLoading]: (state, { snapshotType }) => ({
    ...state,
    isLoading: {
      ...state.isLoading,
      [snapshotType]: true,
    },
  }),
  [actionTypes.doneLoading]: (state, { snapshotType }) => ({
    ...state,
    isLoading: {
      ...state.isLoading,
      [snapshotType]: false,
    },
  }),
  [actionTypes.isLoadingGroups]: state => ({
    ...state,
    isLoadingGroups: true,
  }),
  [actionTypes.doneLoadingGroups]: state => ({
    ...state,
    isLoadingGroups: false,
  }),
  [actionTypes.isLoadingMoreGroups]: state => ({
    ...state,
    isLoadingMoreGroups: true,
  }),
  [actionTypes.doneLoadingMoreGroups]: state => ({
    ...state,
    isLoadingMoreGroups: false,
  }),
  [actionTypes.isApproving]: state => ({
    ...state,
    isApproving: true,
  }),
  [actionTypes.doneApproving]: state => ({
    ...state,
    isApproving: false,
  }),
  [actionTypes.isAddingSnapshotFlake]: state => ({
    ...state,
    isAddingSnapshotFlake: true,
  }),
  [actionTypes.doneAddingSnapshotFlake]: state => ({
    ...state,
    isAddingSnapshotFlake: false,
  }),
  [actionTypes.isLoadingMore]: (state, { snapshotType }) => ({
    ...state,
    isLoadingMore: {
      ...state.isLoadingMore,
      [snapshotType]: true,
    },
  }),
  [actionTypes.doneLoadingMore]: (state, { snapshotType }) => ({
    ...state,
    isLoadingMore: {
      ...state.isLoadingMore,
      [snapshotType]: false,
    },
  }),
  [actionTypes.isLoadingMoreFromGroup]: (state, { group }) => ({
    ...state,
    isLoadingMoreFromGroup: {
      ...state.isLoadingMoreFromGroup,
      [group]: true,
    },
  }),
  [actionTypes.doneLoadingMoreFromGroup]: (state, { group }) => ({
    ...state,
    isLoadingMoreFromGroup: {
      ...state.isLoadingMoreFromGroup,
      [group]: false,
    },
  }),
  [actionTypes.setError]: (state, { error }) => ({
    ...state,
    error,
  }),
  [actionTypes.clearSnapshots]: state => ({
    ...state,
    groups: [],
    snapshots: {
      single: [...state.snapshots.single],
      new: [],
      unmodified: [],
      removed: [],
      flake: [],
    },
  }),
  [actionTypes.receiveSnapshots]: (state, { snapshotType, snapshots }) => ({
    ...state,
    snapshots: {
      ...state.snapshots,
      [snapshotType]: snapshots,
    },
  }),
  [actionTypes.receiveGroups]: (state, { groups }) => ({
    ...state,
    groups,
  }),
  [actionTypes.addGroups]: (state, { groups }) => ({
    ...state,
    groups: [...state.groups, ...groups],
  }),
  [actionTypes.updateGroupsPageInfo]: (state, { groups }) => ({
    ...state,
    groupsPageInfo: {
      ...state.groupsPageInfo,
      hasNextPage: groups.totalCount > state.groups.length,
    },
  }),
  [actionTypes.showMoreFromGroup]: (state, { group }) => ({
    ...state,
    showMoreFromGroup: {
      ...state.showMoreFromGroup,
      [group]: true,
    },
  }),
  [actionTypes.updateGroupSnapshotsPageInfo]: (
    state,
    { group, pageInfo },
  ) => ({
    ...state,
    groups: state.groups.map(g => {
      if (g.group === group.group) {
        return {
          ...g,
          snapshots: {
            ...g.snapshots,
            pageInfo: {
              ...g.pageInfo,
              ...pageInfo,
            },
          },
        };
      }
      return {
        ...g,
      };
    }),
  }),
  [actionTypes.addSnapshotsToGroup]: (state, { group, snapshots }) => ({
    ...state,
    groups: state.groups.map(g => {
      if (g.group === group.group) {
        return {
          ...g,
          snapshots: {
            ...g.snapshots,
            edges: [...g.snapshots.edges, ...snapshots],
          },
        };
      }
      return {
        ...g,
      };
    }),
  }),
  [actionTypes.addSnapshot]: (state, { snapshotType, snapshot }) => ({
    ...state,
    snapshots: {
      ...state.snapshots,
      [snapshotType]: [...state.snapshots[snapshotType], snapshot],
    },
    currentSnapshotId: state.currentSnapshotId
      ? state.currentSnapshotId
      : snapshot.id,
  }),
  [actionTypes.addSnapshots]: (state, { snapshotType, snapshots }) => ({
    ...state,
    snapshots: {
      ...state.snapshots,
      [snapshotType]: [...state.snapshots[snapshotType], ...snapshots],
    },
  }),
  [actionTypes.setCurrentSnapshot]: (state, { currentSnapshotId }) => ({
    ...state,
    currentSnapshotId,
  }),
  [actionTypes.updateSnapshot]: (state, { snapshotType, snapshot }) => ({
    ...state,
    snapshots: {
      ...state.snapshots,
      [snapshotType]: state.snapshots[snapshotType].map(s => {
        if (s.id === snapshot.id) {
          return {
            ...s,
            ...snapshot,
          };
        }
        return {
          ...s,
        };
      }),
    },
  }),
  [actionTypes.updatePageInfo]: (state, { snapshotType, data }) => ({
    ...state,
    pageInfo: {
      ...state.pageInfo,
      [snapshotType]: {
        totalCount: data.totalCount,
        hasNextPage: data.pageInfo.hasNextPage,
      },
    },
    currentCursor: {
      ...state.currentCursor,
      [snapshotType]:
        data.edges.length > 0 ? data.edges[data.edges.length - 1].cursor : null,
    },
  }),
  [actionTypes.updateGroupApprovedSnapshots]: (state, { group, approvedSnapshots }) => ({
    ...state,
    groups: state.groups.map(g => {
      if (g.group === group.group) {
        return {
          ...g,
          approvedSnapshots,
        };
      }
      return {
        ...g,
      };
    }),
  }),
  [actionTypes.updateGroupSnapshot]: (state, { group, snapshot }) => ({
    ...state,
    groups: state.groups.map(g => {
      if (g.group === group.group) {
        return {
          ...g,
          snapshots: {
            ...g.snapshots,
            edges: g.snapshots.edges.map(e => {
              if (e.node.id === snapshot.id) {
                return {
                  ...e,
                  node: {
                    ...e.node,
                    ...snapshot,
                  },
                };
              }
              return {
                ...e,
              };
            }),
          },
        };
      }
      return {
        ...g,
      };
    }),
  }),
  [actionTypes.updateGroupSnapshots]: (state, { group, snapshot }) => ({
    ...state,
    groups: state.groups.map(g => {
      if (g.group === group.group) {
        return {
          ...g,
          snapshots: {
            ...g.snapshots,
            edges: g.snapshots.edges.map(e => {
              return {
                ...e,
                node: {
                  ...e.node,
                  ...snapshot,
                },
              };
            }),
          },
        };
      }
      return {
        ...g,
      };
    }),
  }),
  [actionTypes.approveSnapshots]: (state, { snapshot }) => ({
    ...state,
    groups: state.groups.map(g => ({
      ...g,
      approvedSnapshots: g.snapshots.totalCount,
      snapshots: {
        ...g.snapshots,
        edges: g.snapshots.edges.map(e => ({
          ...e,
          node: {
            ...e.node,
            ...snapshot,
          },
        })),
      },
    })),
  }),
};

export default createReducer(initialState, handler);
