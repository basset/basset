import gql from 'graphql-tag';

export default gql`
  mutation editProject($id: ID!, $projectInput: ProjectInput) {
    editProject(id: $id, projectInput: $projectInput) {
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
