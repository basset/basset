import gql from 'graphql-tag';
import organizationFragment from '../fragments/organization.js';

export default gql`
  ${organizationFragment}
  query organization($id: ID!) {
    organization(id: $id) {
      ...organizationFragment
    }
  }
`;
