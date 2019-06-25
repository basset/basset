import gql from 'graphql-tag';

export default gql`
  mutation createInvite($email: String!, $organizationId: ID!) {
    createInvite(email: $email, organizationId: $organizationId) {
      id
      email
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
