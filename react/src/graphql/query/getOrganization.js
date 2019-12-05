import gql from 'graphql-tag';

export default gql`
  query organization($id: ID!) {
    organization(id: $id) {
      id
      name
      admin
      monthlySnapshotLimit
      enforceSnapshotLimit
      currentSnapshotCount
      buildRetentionPeriod
      enforceBuildRetention
    }
  }
`;
