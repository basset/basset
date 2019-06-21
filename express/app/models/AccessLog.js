const BaseModel = require('./BaseModel');

class AccessLog extends BaseModel {
  static get tableName() {
    return 'accessLog';
  }
  static get jsonSchema() {
    return {
      type: 'object',
      required: [],
      properties: {
        id: { type: 'integer' },
        email: { type: 'string', minLength: 1, maxLength: 255 },
        userAgent: { type: 'string', minLength: 1, maxLength: 255 },
        IpAddress: { type: 'string' },
        LogoutTime: { type: 'string' },
      },
    };
  }
}

module.exports = AccessLog;
