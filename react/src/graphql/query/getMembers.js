import gql from 'graphql-tag';

export default gql`
  query members($organizationId: ID!, $first: Int!, $after: String) {
    organizationMembers(
      organizationId: $organizationId
      first: $first
      after: $after
    ) {
      pageInfo {
        hasNextPage
      }
      edges {
        cursor
        node {
          id
          active
          admin
          createdAt
          user {
            id
            name
            email
            profileImage
          }
        }
      }
    }
  }
`;
