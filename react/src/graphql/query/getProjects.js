import gql from 'graphql-tag';
import projectFragment from '../fragments/project.js';

export default gql`
  ${projectFragment}
  query projects($organizationId: ID!, $first: Int!, $after: String) {
    projects(organizationId: $organizationId, first: $first, after: $after) {
      pageInfo {
        hasNextPage
      }
      edges {
        cursor
        node {
          ...projectFragment
        }
      }
    }
  }
`;
