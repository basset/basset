import gql from 'graphql-tag';
import organizationFragment from '../fragments/organization.js';

export default gql`
  ${organizationFragment}
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
