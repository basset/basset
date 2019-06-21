import gql from 'graphql-tag';

export default gql`
  query project($id: ID!) {
    project(id: $id) {
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
      organizationId
    }
  }
`;
