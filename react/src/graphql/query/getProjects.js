import gql from 'graphql-tag';

export default gql`
  query projects($organizationId: ID!, $first: Int!, $after: String) {
    projects(organizationId: $organizationId, first: $first, after: $after) {
      pageInfo {
        hasNextPage
      }
      edges {
        cursor
        node {
          id
          name
          type
          key
          hasToken
          provider
          repoOwner
          repoName
          repoActive
          defaultBranch
          defaultWidth
          browsers
          slackWebhook
          slackActive
          slackVariable
          hideSelectors
        }
      }
    }
  }
`;
