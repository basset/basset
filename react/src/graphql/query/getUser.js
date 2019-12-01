import gql from 'graphql-tag';

export default gql`
  query whoami {
    whoami {
      id
      email
      name
      admin
      profileImage
      lastLogin
      canCreateOrganizations
      organizations(first: 100) {
        edges {
          node {
            id
            name
            admin
            monthlySnapshotLimit
            enforceSnapshotLimit
            currentSnapshotCount
            snapshotRetentionPeriod
            enforceSnapshotRetention
          }
        }
      }
      providers(first: 10) {
        edges {
          node {
            id
            provider
          }
        }
      }
    }
  }
`;
