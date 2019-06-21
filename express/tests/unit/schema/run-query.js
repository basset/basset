const { graphql } = require('graphql');

const schema = require('../../../app/schema/schema');

const runQuery = async (query, user, variables, context = {}) => {
  let _user;
  if (user) {
    _user = await user.$query().eager('organizations');
  }
  _context = {
    req: {
      isAuthenticated: () => true,
      user: _user,
    },
    res: {},
    loaders: [],
    ...context,
  };

  return graphql(schema, query, {}, _context, variables);
};

module.exports = runQuery;
