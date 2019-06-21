const { ApolloServer } = require('apollo-server-express');
const costAnalysis = require('graphql-cost-analysis').default;

class ProtectedApolloServer extends ApolloServer {
  async createGraphQLServerOptions(req, res) {
    const options = await super.createGraphQLServerOptions(req, res);
    return {
      ...options,
      validationRules: [
        costAnalysis({
          maximumCost: 1000,
          defaultCost: 1,
          variables: req.body.variables,
        }),
      ],
    };
  }
}

module.exports = ProtectedApolloServer;
