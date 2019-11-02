import gql from 'graphql-tag';
import projectFragment from '../fragments/project.js';

export default gql`
  ${projectFragment}
  mutation createProject($name: String!, $organizationId: ID!) {
    createProject(name: $name, organizationId: $organizationId) {
      ...projectFragment
    }
  }
`;
