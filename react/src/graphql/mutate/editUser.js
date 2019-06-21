import gql from 'graphql-tag';

export default gql`
  mutation editUser($name: String!) {
    editUser(name: $name) {
      id
      email
      name
      admin
      profileImage
      lastLogin
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
