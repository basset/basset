import gql from 'graphql-tag';

export default gql`
  mutation linkProviderToProject($id: ID!, $provider: String!) {
    linkProviderToProject(id: $id, provider: $provider) {
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
