import gql from 'graphql-tag';

export default gql`
  query modifiedSnapshotGroups($buildId: ID!, $limit: Int!, $offset: Int!, $first: Int!) {
    modifiedSnapshotGroups(buildId: $buildId, limit: $limit, offset: $offset) {
      totalCount
      edges {
        node {
          approvedSnapshots
          group
          snapshots(first: $first) {
            totalCount
            pageInfo {
              hasNextPage
            }
            edges {
              cursor
              node {
                id
                imageLocation
                approved
                approvedOn
                title
                width
                browser
                diff
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
              }
            }
          }
        }
      }
    }
  }
`;
