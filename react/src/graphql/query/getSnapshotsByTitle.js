import gql from 'graphql-tag';

export default gql`
  query snapshotsByTitle(
    $projectId: ID!
    $title: String!
    $first: Int!
    $after: String
    $browser: String
    $width: String
  ) {
    snapshotsByTitle(
      projectId: $projectId
      title: $title
      first: $first
      after: $after
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
          imageLocation
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
