import gql from 'graphql-tag';

export default gql`
  mutation approveSnapshot($snapshotId: ID!) {
    approveSnapshot(id: $snapshotId) {
      id
      approved
      approvedOn
      approvedBy {
        id
        user {
          id
          name
        }
      }
    }
  }
`;
