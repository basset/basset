import gql from 'graphql-tag';

export default gql`
  query builds(
    $organizationId: ID!
    $projectId: ID!
    $first: Int!
    $before: String
  ) {
    builds(
      organizationId: $organizationId
      projectId: $projectId
      first: $first
      before: $before
      orderBy: "-createdAt"
    ) {
      pageInfo {
        hasNextPage
      }
      edges {
        cursor
        node {
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
          totalSnapshots
          approvedSnapshots
          modifiedSnapshots
          flakedSnapshots
          newSnapshots
          removedSnapshots
          error
        }
      }
    }
  }
`;
