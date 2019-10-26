import gql from 'graphql-tag';

export default gql`
  query snapshotsByTitle(
    $projectId: ID!
    $title: String!
    $first: Int!
    $before: String
    $browser: String
    $width: String
  ) {
    snapshotsByTitle(
      projectId: $projectId
      title: $title
      first: $first
      before: $before
      browser: $browser
      width: $width
      diff: true
    ) {
      pageInfo {
        hasNextPage
      }
      totalCount
      edges {
        cursor
        node {
          id
          url
          approved
          approvedOn
          title
          width
          browser
          diff
          buildId
          build {
            id
            number
            branch
            commitSha
            commitMessage
            committerName
            committerEmail
            commitDate
            authorName
            authorDate
            authorEmail
            createdAt
            updatedAt
            completedAt
            submittedAt
            cancelledAt
          }
          projectId
          organizationId
          approvedBy {
            user {
              id
              name
            }
          }
        }
      }
    }
  }
`;
