import gql from 'graphql-tag';

export default gql`
  mutation resendInvite($id: ID!) {
    resendInvite(id: $id) {
      id
      accepted
      updatedAt
      fromMember {
        id
        user {
          id
          name
          profileImage
        }
      }
    }
  }
`;
