export const getError = state => state.builds.error;
export const getIsLoading = state => state.builds.isLoading;
export const getIsLoadingSingle = state => state.builds.isLoadingSingle;
export const getBuilds = state => state.builds.builds;
export const getCurrentBuild = state =>
  state.builds.builds.find(b => b.id === state.builds.currentBuildId);
export const getHasNextPage = state => state.builds.pageInfo.hasNextPage;
export const getIsLoadingMore = state => state.builds.isLoadingMore;
