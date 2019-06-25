import gql from 'graphql-tag';

export default gql`
  query snapshots(
    $buildId: ID!
    $first: Int!
    $after: String
    $type: SnapshotType
    $title: String
  ) {
    snapshots(
      buildId: $buildId
      first: $first
      after: $after
      title: $title
      type: $type
    ) {
      pageInfo {
        hasNextPage
      }
      totalCount
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
