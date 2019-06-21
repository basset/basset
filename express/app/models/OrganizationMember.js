const { Model } = require('objection');
const BaseModel = require('./BaseModel');

class OrganizationMember extends BaseModel {
  static get tableName() {
    return 'organizationMember';
  }

  async canRead(user) {
    return user.organizations.map(o => o.id).includes(this.organizationId);
  }

  async canEdit(user) {
    if (this.userId === user.id) {
      return true;
    }
    return user.isAdmin(this.organizationId);
  }

  async canDelete(user) {
    return this.canEdit(user);
  }

  static authorizationFilter(user) {
    return this.query().whereIn(
      'organizationId',
      user.organizations.map(o => o.id),
    );
  }

  static get relationMappings() {
    const User = require('./User');
    const Organization = require('./Organization');
    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'organizationMember.userId',
          to: 'user.id',
        },
      },
      organization: {
        relation: Model.BelongsToOneRelation,
        modelClass: Organization,
        join: {
          from: 'organizationMember.organizationId',
          to: 'organization.id',
        },
      },
    };
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: [],
      properties: {
        id: { type: 'integer' },
        active: { type: 'boolean', default: true },
        admin: { type: 'boolean', default: false },
      },
    };
  }
}

module.exports = OrganizationMember;
