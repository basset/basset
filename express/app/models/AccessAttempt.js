const BaseModel = require('./BaseModel');

class AccessAttempt extends BaseModel {
  static get tableName() {
    return 'accessAttempt';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: [],
      properties: {
        id: { type: 'integer' },
        email: { type: 'string', minLength: 1, maxLength: 255 },
        userAgent: { type: 'string', minLength: 1, maxLength: 255 },
        ipAddress: { type: 'string' },
        failureAttempt: { type: 'integer' },
      },
    };
  }
}

module.exports = AccessAttempt;
