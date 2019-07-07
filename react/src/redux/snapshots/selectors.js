export const getError = state => state.snapshots.error;
export const getIsLoading = state => state.snapshots.isLoading;
export const getSnapshots = state => state.snapshots.snapshots;
export const getSnapshotGroups = state => state.snapshots.groups;
export const getCurrentSnapshot = state =>
  state.snapshots.snapshots.single.find(
    b => b.id === state.snapshots.currentSnapshotId,
  );
export const getCurrentSnapshotId = state => state.snapshots.currentSnapshotId;
export const getPageInfo = state => state.snapshots.pageInfo;
export const getIsLoadingMore = state => state.snapshots.isLoadingMore;
export const getIsApproving = state => state.snapshots.isApproving;
export const getShowMoreFromGroup = state => state.snapshots.showMoreFromGroup;
export const getIsLoadingMoreFromGroup = state => state.snapshots.isLoadingMoreFromGroup;
export const getIsLoadingMoreGroups = state => state.snapshots.isLoadingMoreGroups;
export const getIsLoadingGroups = state => state.snapshots.isLoadingGroups;
export const getGroupsPageInfo = state => state.snapshots.groupsPageInfo;