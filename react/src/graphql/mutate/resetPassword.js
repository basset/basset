import gql from 'graphql-tag';

export default gql`
  mutation passwordReset($id: String!, $token: String!, $password: String!) {
    resetPassword(id: $id, token: $token, password: $password)
  }
`;
