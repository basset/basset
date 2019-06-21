import gql from 'graphql-tag';

export default gql`
  mutation login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
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
