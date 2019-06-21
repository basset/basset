import gql from 'graphql-tag';

export default gql`
  mutation deleteInvite($id: ID!) {
    deleteInvite(id: $id)
  }
`;
