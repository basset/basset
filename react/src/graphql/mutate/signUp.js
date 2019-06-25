import gql from 'graphql-tag';

export default gql`
  mutation signUp($email: String!, $password: String!, $name: String!) {
    signUp(email: $email, password: $password, name: $name) {
      id
      email
      name
    }
  }
`;
