import gql from 'graphql-tag';
import projectFragment from '../fragments/project.js';

export default gql`
  ${projectFragment}
  mutation unlinkProviderToProject($id: ID!, $provider: String) {
    unlinkProviderToProject(id: $id, provider: $provider) {
      ...projectFragment
    }
  }
`;
