/**
 * TODO:
 * api token => hmac authenitication
 * create an auth decorator which will set the user
 * give the token scopes so that it cannot do admin level stuff
 *
 */
const { Model } = require('objection');
const BaseModel = require('./BaseModel');

class ApiToken extends BaseModel {
  static get tableName() {
    return 'apiToken';
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
    const Organization = require('./Organization');
    const Project = require('./Project');
    const User = require('./User');
    const OrganizationMember = require('./OrganizationMember');
    return {
      organization: {
        relation: Model.BelongsToOneRelation,
        modelClass: Organization,
        join: {
          from: 'apiToken.organizationId',
          to: 'organization.id',
        },
      },
      project: {
        relation: Model.BelongsToOneRelation,
        modelClass: Project,
        join: {
          from: 'apiToken.projectId',
          to: 'project.id',
        },
      },
      user: {
        relation: Model.HasOneThroughRelation,
        modelClass: User,
        join: {
          from: 'apiToken.organizationMemberId',
          through: {
            from: 'organizationMember.id',
            to: 'organizationMember.userId',
          },
          to: 'user.id',
        },
      },
      organizationMember: {
        relation: Model.BelongsToOneRelation,
        modelClass: OrganizationMember,
        join: {
          from: 'apiToken.organizationMemberId',
          to: 'organizationMember.id',
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
        name: { type: 'string', minLength: 1, maxLength: 255 },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' },
      },
    };
  }
}

module.exports = ApiToken;
