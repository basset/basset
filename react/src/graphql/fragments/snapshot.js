export default `
fragment snapshotFragment on Snapshot {
  id
  approved
  approvedOn
  title
  width
  browser
  diff
  buildId
  projectId
  organizationId
  approvedBy {
    user {
      id
      name
    }
  }
  previousApproved {
    id
    imageLocation
    approved
    approvedOn
    approvedBy {
      user {
        id
        name
      }
    }
  }
  snapshotDiff {
    id
    snapshotFromId
    snapshotToId
  }
  snapshotFlake {
    id
    ignoredCount
    createdBy {
      user {
        id
        name
      }
    }
  }
}`;
