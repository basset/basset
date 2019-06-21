import gql from 'graphql-tag';

export default gql`
  query modifiedSnapshotGroups($buildId: ID!, $group: Int, $first: Int, $after: String) {
    modifiedSnapshots(buildId: $buildId, first: $first, after: $after, group: $group) {
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
        }
      }
    }
  }
`;
