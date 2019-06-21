const {
  SchemaDirectiveVisitor,
  AuthenticationError,
} = require('apollo-server-express');
const { defaultFieldResolver } = require('graphql');

class ObjectRequireLoginDirective extends SchemaDirectiveVisitor {
  visitObject(type) {
    this.ensureFieldsWrapped(type);
    type._requireLogin = true;
  }

  ensureFieldsWrapped(objectType) {
    if (objectType._requireLogin) return;
    objectType._requireLogin = true;

    const fields = objectType.getFields();

    Object.keys(fields).forEach(fieldName => {
      const field = fields[fieldName];
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
    });
  }
}
module.exports = ObjectRequireLoginDirective;
