import gql from 'graphql-tag';

export default gql`
  mutation addSnapshotFlake($id: ID!) {
    addSnapshotFlake(id: $id) {
      id
      url
      createdBy {
        user {
          id
          name
        }
      }
    }
  }
`;
