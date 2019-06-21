import gql from 'graphql-tag';

export default gql`
  mutation acceptInvite(
    $id: ID!
    $token: String!
    $name: String
    $password: String
  ) {
    acceptInvite(id: $id, token: $token, name: $name, password: $password) {
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
