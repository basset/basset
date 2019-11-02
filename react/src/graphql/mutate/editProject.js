import gql from 'graphql-tag';
import projectFragment from '../fragments/project.js';

export default gql`
  ${projectFragment}
  mutation editProject($id: ID!, $projectInput: ProjectInput) {
    editProject(id: $id, projectInput: $projectInput) {
      ...projectFragment
    }
  }
`;
