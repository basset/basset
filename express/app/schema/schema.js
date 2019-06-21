const { makeExecutableSchema } = require('apollo-server-express');

const FieldRequiredLoginDirective = require('../utils/graphql/field-auth-directive');
const ObjectRequiredLoginDirective = require('../utils/graphql/object-auth-directive');

const organizationMember = require('./organizationMember');
const user = require('./user');
const organization = require('./organization');
const project = require('./project');
const invite = require('./invite');
const build = require('./build');
const asset = require('./asset');
const snapshot = require('./snapshot');

const schemaDefinition = `
  directive @authField on FIELD_DEFINITION
  directive @authObject on OBJECT
  directive @cost(
    multipliers: [String],
    useMultipliers: Boolean,
    complexity: CostComplexity
  ) on OBJECT | FIELD_DEFINITION

  input CostComplexity {
    min: Int = 1,
    max: Int
  }
  scalar Upload
  interface Node {
    id: ID!
  }
  input ConnectionInput {
    before: String!
    after: String!
    first: Int!
    last: Int!
  }
  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }
  type Query {
    _: Boolean
  }
  type Mutation {
    _: Boolean
  }
  schema {
    query: Query
    mutation: Mutation
  }
`;

const schema = makeExecutableSchema({
  typeDefs: [
    schemaDefinition,
    organizationMember.typeDefs,
    user.typeDefs,
    organization.typeDefs,
    project.typeDefs,
    invite.typeDefs,
    build.typeDefs,
    asset.typeDefs,
    snapshot.typeDefs,
  ],
  resolvers: [
    organizationMember.resolvers,
    user.resolvers,
    organization.resolvers,
    project.resolvers,
    invite.resolvers,
    build.resolvers,
    asset.resolvers,
    snapshot.resolvers,
  ],
  resolverValidationOptions: {
    requireResolversForResolveType: false,
  },
  schemaDirectives: {
    authField: FieldRequiredLoginDirective,
    authObject: ObjectRequiredLoginDirective,
  },
});

module.exports = schema;
