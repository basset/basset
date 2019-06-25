import gql from 'graphql-tag';

export default gql`
  mutation changePassword($password: String!) {
    changePassword(password: $password)
  }
`;
