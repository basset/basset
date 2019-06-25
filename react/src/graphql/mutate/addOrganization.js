import gql from 'graphql-tag';

export default gql`
  mutation createOrganization($name: String!) {
    createOrganization(name: $name) {
      id
      name
      admin
    }
  }
`;
