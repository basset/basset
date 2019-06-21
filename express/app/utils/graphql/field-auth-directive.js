const {
  SchemaDirectiveVisitor,
  AuthenticationError,
} = require('apollo-server-express');
const { defaultFieldResolver } = require('graphql');

class FieldRequireLoginDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field, details) {
    this.ensureFieldWrapped(field);
    field._requireLogin = true;
  }

  ensureFieldWrapped(field) {
    const { resolve = defaultFieldResolver } = field;
    field.resolve = async function(...args) {
      const loginRequired = field._requireLogin || objectType._requireLogin;
      if (!loginRequired) {
        return resolve.apply(this, args);
      }
      const context = args[2];

      if (!context.req.isAuthenticated || !context.req.isAuthenticated()) {
        throw new AuthenticationError('not authorized');
      }

      return resolve.apply(this, args);
    };
  }
}
module.exports = FieldRequireLoginDirective;
