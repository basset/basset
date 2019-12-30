export default `
fragment snapshotFragment on Snapshot {
  id
  url
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
    url
    approved
    approvedOn
    width
    approvedBy {
      user {
        id
        name
      }
    }
  }
  snapshotDiff {
    id
    url
    snapshotFromId
    snapshotToId
    centers {
      x
      y
      radius
    }
  }
  snapshotFlake {
    id
    url
    ignoredCount
    createdBy {
      user {
        id
        name
      }
    }
  }
}`;
