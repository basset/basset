import gql from 'graphql-tag';

export default gql`
  mutation approveGroupSnapshots($buildId: ID!, $group: Int!) {
    approveGroupSnapshots(buildId: $buildId, group: $group)
  }
`;
