import gql from 'graphql-tag';

export default gql`
  mutation approveSnapshots($buildId: ID!) {
    approveSnapshots(buildId: $buildId)
  }
`;
