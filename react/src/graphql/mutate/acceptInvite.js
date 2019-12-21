import gql from 'graphql-tag';
import organizationFragment from '../fragments/organization';

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
            ...organizationFragment
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
