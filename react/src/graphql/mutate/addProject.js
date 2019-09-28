import gql from 'graphql-tag';

export default gql`
  mutation createProject($name: String!, $type: ProjectType, $organizationId: ID!) {
    createProject(name: $name, type: $type, organizationId: $organizationId) {
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
`;
