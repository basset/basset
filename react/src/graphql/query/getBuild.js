import gql from 'graphql-tag';

export default gql`
  query build($id: ID!) {
    build(id: $id) {
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
      removedSnapshots
      newSnapshots
      projectId
      organizationId
      previousBuild {
        id
        number
        branch
        commitSha
        commitMessage
        committerName
        committerEmail
        commitDate
        authorName
        authorEmail
        createdAt
        updatedAt
        completedAt
        error
      }
    }
  }
`;
