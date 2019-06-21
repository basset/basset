import gql from 'graphql-tag';

export default gql`
  query snapshot($id: ID!) {
    snapshot(id: $id) {
      id
      buildId
      projectId
      organizationId
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
`;
