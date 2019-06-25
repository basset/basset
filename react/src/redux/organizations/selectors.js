export const getError = state => state.organizations.error;
export const getIsLoading = state => state.organizations.isLoading;
export const getIsUpdating = state => state.organizations.isUpdating;
export const getOrganizations = state => state.organizations.organizations;
export const getCurrentOrganization = state =>
  state.organizations.organizations.find(
    org => org.id === state.organizations.currentOrganizationId,
  ) || null;
