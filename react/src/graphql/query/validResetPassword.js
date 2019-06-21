import gql from 'graphql-tag';

export default gql`
  query validResetPassword($id: String!, $token: String!) {
    validResetPassword(id: $id, token: $token)
  }
`;
