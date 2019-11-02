import gql from 'graphql-tag';
import projectFragment from '../fragments/project.js';

export default gql`
  ${projectFragment}
  query project($id: ID!) {
    project(id: $id) {
      ...projectFragment
    }
  }
`;
