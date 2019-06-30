import gql from 'graphql-tag';
import snapshotFragment from '../fragments/snapshot.js';

export default gql`
  ${snapshotFragment}
  query snapshot($id: ID!) {
    snapshot(id: $id) {
      ...snapshotFragment
    }
  }
`;
