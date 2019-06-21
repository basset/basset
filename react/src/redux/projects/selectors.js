export const getError = state => state.projects.error;
export const getIsLoading = state => state.projects.isLoading;
export const getIsUpdating = state => state.projects.isUpdating;
export const getProjects = state => state.projects.projects;
export const getCurrentProject = state =>
  state.projects.projects.find(p => p.id === state.projects.currentProjectId);
export const getHasNextPage = state => state.projects.pageInfo.hasNextPage;
export const getIsLoadingMore = state => state.projects.isLoadingMore;
