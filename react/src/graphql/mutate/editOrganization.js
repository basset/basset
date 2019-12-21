import gql from 'graphql-tag';
import organizationFragment from '../fragments/organization';

export default gql`
  ${organizationFragment}
  mutation editOrganization($id: ID!, $name: String!) {
    editOrganization(id: $id, name: $name) {
      ...organizationFragment
    }
  }
`;
