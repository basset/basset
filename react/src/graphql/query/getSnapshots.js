import gql from 'graphql-tag';
import snapshotFragment from '../fragments/snapshot.js';

export default gql`
  ${snapshotFragment}
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
          ...snapshotFragment
        }
      }
    }
  }
`;
