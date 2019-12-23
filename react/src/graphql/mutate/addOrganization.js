import gql from 'graphql-tag';
import organizationFragment from '../fragments/organization';

export default gql`
  ${organizationFragment}
  mutation createOrganization($name: String!) {
    createOrganization(name: $name) {
      ...organizationFragment
    }
  }
`;
