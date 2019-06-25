import gql from 'graphql-tag';

export default gql`
  mutation editOrganization($id: ID!, $name: String!) {
    editOrganization(id: $id, name: $name) {
      id
      name
      admin
    }
  }
`;
