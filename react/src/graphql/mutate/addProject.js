import gql from 'graphql-tag';

export default gql`
  mutation createProject($name: String!, $organizationId: ID!) {
    createProject(name: $name, organizationId: $organizationId) {
      id
      name
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
`;
