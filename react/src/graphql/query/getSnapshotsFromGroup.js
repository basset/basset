import gql from 'graphql-tag';
import snapshotFragment from '../fragments/snapshot.js';

export default gql`
  ${snapshotFragment}
  query modifiedSnapshotGroups(
    $buildId: ID!
    $group: Int
    $first: Int
    $after: String
  ) {
    modifiedSnapshots(
      buildId: $buildId
      first: $first
      after: $after
      group: $group
    ) {
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
`;
