import gql from 'graphql-tag';

export default gql`
  mutation removeMember($id: ID!) {
    removeMember(id: $id)
  }
`;
