const { Model } = require('objection');
const BaseModel = require('./BaseModel');

class OrganizationInvite extends BaseModel {
  static get tableName() {
    return 'organizationInvite';
  }

  async canRead(user) {
    return user.organizations.map(o => o.id).includes(this.organizationId);
  }

  async canEdit(user) {
    return user.isAdmin(this.organizationId);
  }

  async canDelete(user) {
    return user.isAdmin(this.organizationId);
  }

  async canCreate(user) {
    return user.isAdmin(this.organizationId);
  }

  static authorizationFilter(user) {
    return this.query().whereIn(
      'organizationId',
      user.organizations.map(o => o.id),
    );
  }

  static get relationMappings() {
    const OrganizationMember = require('./OrganizationMember');
    const Organization = require('./Organization');
    return {
      organizationMembers: {
        relation: Model.HasManyRelation,
        modelClass: OrganizationMember,
        join: {
          from: 'organizationInvite.organizationId',
          to: 'organizationMember.organizationId',
        },
      },
      fromMember: {
        relation: Model.BelongsToOneRelation,
        modelClass: OrganizationMember,
        join: {
          from: 'organizationInvite.fromId',
          to: 'organizationMember.id',
        },
      },
      organization: {
        relation: Model.BelongsToOneRelation,
        modelClass: Organization,
        join: {
          from: 'organizationInvite.organizationId',
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
        accepted: { type: 'boolean' },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' },
      },
    };
  }
}

module.exports = OrganizationInvite;
