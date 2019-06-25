import gql from 'graphql-tag';

export default gql`
  mutation activate($id: String!, $token: String!) {
    activate(id: $id, token: $token) {
      id
    }
  }
`;
