import gql from 'graphql-tag';
import projectFragment from '../fragments/project.js';

export default gql`
  ${projectFragment}
  mutation linkProviderToProject($id: ID!, $provider: String!) {
    linkProviderToProject(id: $id, provider: $provider) {
      ...projectFragment
    }
  }
`;
