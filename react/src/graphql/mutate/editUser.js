import gql from 'graphql-tag';
import organizationFragment from '../fragments/organization.js';

export default gql`
  ${organizationFragment}
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
