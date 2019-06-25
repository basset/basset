import gql from 'graphql-tag';

export default gql`
  query invites($organizationId: ID!, $first: Int!, $after: String) {
    invites(organizationId: $organizationId, first: $first, after: $after) {
      pageInfo {
        hasNextPage
      }
      edges {
        cursor
        node {
          id
          email
          accepted
          updatedAt
          __typename
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
    }
  }
`;
