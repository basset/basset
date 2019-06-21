import gql from 'graphql-tag';

export default gql`
  mutation unlinkProviderToProject($id: ID!, $provider: String) {
    unlinkProviderToProject(id: $id, provider: $provider) {
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
