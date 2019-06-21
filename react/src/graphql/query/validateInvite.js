import gql from 'graphql-tag';

export default gql`
  query validateInvite($id: ID!, $token: String!) {
    validateInvite(id: $id, token: $token) {
      id
      email
      fromMember {
        user {
          id
          name
          email
        }
      }
      organization {
        id
        name
      }
    }
  }
`;
