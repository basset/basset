export default `
fragment organizationFragment on Organization {
  id
  name
  admin
  monthlySnapshotLimit
  enforceSnapshotLimit
  currentSnapshotCount
  buildRetentionPeriod
  enforceBuildRetention
  allowPublicProjects
}`;
