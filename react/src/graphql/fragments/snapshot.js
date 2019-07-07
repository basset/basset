export default `
fragment snapshotFragment on Snapshot {
  id
  imageLocation
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
    snapshotFromId
    snapshotToId
    imageLocation
  }
  snapshotFlake {
    imageLocation
    ignoredCount
    createdBy {
      user {
        id
        name
      }
    }
  }
}`;
