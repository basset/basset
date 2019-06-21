const { AuthenticationError } = require('apollo-server-express');

const runQuery = require('./run-query');
const { createUser } = require('../../utils/user');
const {
  createOrganization,
  addUserToOrganization,
} = require('../../utils/organization');
const { createProject } = require('../../utils/project');
const { createCursor } = require('../../../app/utils/graphql/paginate');

describe('schema', async () => {
  let organization, user, query, variables;
  beforeAll(async () => {
    organization = await createOrganization('test');
    query = `
      query organization($id: ID!) {
        organization(id: $id) {
          id
        }
      }
    `;
    variables = {
      id: organization.id,
    };
    user = await createUser('test@basset.io');
    await addUserToOrganization(organization.id, user.id);
  });

  test('public user cannot query fields requiring authentication', async () => {
    try {
      await runQuery(query, null, variables);
    } catch (error) {
      expect(error).toBeInstanceOf(AuthenticationError);
      expect(error.message).toEqual('Not authorized');
    }
  });

  test('authenticated users can query', async () => {
    const result = await runQuery(query, user, variables);
    expect(result.data.organization).toBeDefined();
  });
});

describe('pagination', () => {
  let query, organization, user;
  const projects = [];
  beforeAll(async () => {
    organization = await createOrganization('test');
    user = await createUser('tester@basset.io');
    await addUserToOrganization(organization.id, user.id);
    for await (const [index] of Array(20).entries()) {
      const project = await createProject(`test-${index + 1}`, organization.id);
      projects.push(project);
    }
    query = `
      query projects($first: Int, $last: Int, $after: String, $before: String, $organizationId: ID!) {
        projects(first: $first, last: $last, after: $after, before: $before, organizationId: $organizationId) {
          pageInfo {
            hasNextPage
            hasPreviousPage
          }
          totalCount
          edges {
            cursor
            node {
              id
              name
            }
          }
        }
      }
    `;
  });
  test('it returns the total count', async () => {
    const variables = {
      organizationId: organization.id,
      first: 5,
    };
    const result = await runQuery(query, user, variables);
    expect(result.data.projects.totalCount).toBe(20);
    expect(result.data.projects.pageInfo.hasNextPage).toBe(true);
    expect(result.data.projects.pageInfo.hasPreviousPage).toBe(false);
  });

  test('previousPage is true when past first record', async () => {
    const variables = {
      organizationId: organization.id,
      first: 5,
      after: createCursor(projects[1], 'createdAt'),
    };
    const result = await runQuery(query, user, variables);
    expect(result.data.projects.totalCount).toBe(20);
    expect(result.data.projects.pageInfo.hasPreviousPage).toBe(true);
    expect(result.data.projects.pageInfo.hasNextPage).toBe(true);
  });

  test('nextPage is false when there are no more records', async () => {
    const variables = {
      organizationId: organization.id,
      first: 5,
      after: createCursor(projects[14], 'createdAt'),
    };
    const result = await runQuery(query, user, variables);
    expect(result.data.projects.totalCount).toBe(20);
    expect(result.data.projects.pageInfo.hasPreviousPage).toBe(true);
    expect(result.data.projects.pageInfo.hasNextPage).toBe(false);
  });

  test('after cursor returns the next record', async () => {
    const variables = {
      organizationId: organization.id,
      first: 1,
      after: createCursor(projects[1], 'createdAt'),
    };
    const result = await runQuery(query, user, variables);
    expect(result.data.projects.edges[0].node.id).toBe(projects[2].id);
    expect(result.data.projects.edges[0].cursor).toBe(
      createCursor(projects[2], 'createdAt'),
    );
  });

  test('before cursor returns the previous record', async () => {
    const variables = {
      organizationId: organization.id,
      first: 1,
      before: createCursor(projects[1], 'createdAt'),
    };
    const result = await runQuery(query, user, variables);
    expect(result.data.projects.edges[0].node.id).toBe(projects[0].id);
    expect(result.data.projects.edges[0].cursor).toBe(
      createCursor(projects[0], 'createdAt'),
    );
  });

  test('last will return the previous record', async () => {
    const variables = {
      organizationId: organization.id,
      last: 5,
      before: createCursor(projects[19], 'createdAt'),
    };
    const result = await runQuery(query, user, variables);
    expect(result.data.projects.edges[0].cursor).toBe(
      createCursor(projects[14], 'createdAt'),
    );
    expect(result.data.projects.edges.map(e => e.node)).toEqual(
      projects.slice(14, 19).map(({ id, name }) => ({ id, name })),
    );
  });

  test('cannot use a negative value for first', async () => {
    const variables = {
      organizationId: organization.id,
      first: -1,
    };

    const result = await runQuery(query, user, variables);
    expect(result.errors[0].message).toBe('first field must be greater than 0');
  });

  test('cannot use a negative value for last', async () => {
    const variables = {
      organizationId: organization.id,
      last: -1,
    };

    const result = await runQuery(query, user, variables);
    expect(result.errors[0].message).toBe('last field must be greater than 0');
  });
});
