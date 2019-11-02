export default `
fragment projectFragment on Project {
  id
  name
  key
  type
  hasToken
  scmProvider
  scmConfig {
    repoName
    repoOwner
    projectId
    repoSlug
    username
  }
  scmActive
  defaultBranch
  defaultWidth
  browsers
  slackWebhook
  slackActive
  slackVariable
  hideSelectors
  organizationId
}`;
