import gql from 'graphql-tag';
import snapshotFragment from '../fragments/snapshot.js';

export default gql`
  ${snapshotFragment}
  query modifiedSnapshotGroups(
    $buildId: ID!
    $limit: Int!
    $offset: Int!
    $first: Int!
  ) {
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
                ...snapshotFragment
              }
            }
          }
        }
      }
    }
  }
`;
