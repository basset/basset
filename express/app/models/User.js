const { Model } = require('objection');
const BaseModel = require('./BaseModel');
const bcrypt = require('bcrypt');
const settings = require('../settings');

const OrganizationMember = require('./OrganizationMember');

class User extends BaseModel {
  static get tableName() {
    return 'user';
  }

  async isAdmin(organizationId) {
    const member = await OrganizationMember.query()
      .where('organizationId', organizationId)
      .andWhere('userId', this.id)
      .first();

    if (!member) {
      return false;
    }
    return member.admin;
  }

  async canRead(user) {
    const memberOf = await OrganizationMember.query()
      .whereIn('organizationId', user.organizations.map(o => o.id))
      .andWhere('userId', this.id)
      .first();
    return !!memberOf;
  }

  async canCreateOrganizations() {
    if (settings.site.private) {
      return this.admin;
    }
    return true;
  }

  async canEdit(user) {
    return user.id === this.id;
  }

  async canDelete(user) {
    return user.id === this.id;
  }

  static authorizationFilter(user) {
    return this.query()
      .joinRelation('organizations')
      .whereIn('organizations.id', user.organizations.map(o => o.id));
  }

  async $beforeInsert(context) {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
    return super.$beforeInsert(context);
  }

  async changePassword(newPassword) {
    const password = await bcrypt.hash(newPassword, 10);
    return this.$query().update({
      password,
    });
  }

  static get relationMappings() {
    const UserProvider = require('./UserProvider');
    const OrganizationMember = require('./OrganizationMember');
    const Organization = require('./Organization');
    return {
      providers: {
        relation: Model.HasManyRelation,
        modelClass: UserProvider,
        join: {
          from: 'user.id',
          to: 'userProvider.userId',
        },
      },
      organizations: {
        relation: Model.ManyToManyRelation,
        modelClass: Organization,
        join: {
          from: 'user.id',
          through: {
            from: 'organizationMember.userId',
            to: 'organizationMember.organizationId',
          },
          to: 'organization.id',
        },
      },
      organizationMemberships: {
        relation: Model.HasManyRelation,
        modelClass: OrganizationMember,
        join: {
          from: 'user.id',
          to: 'organizationMember.userId',
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
        email: { type: 'string', minLength: 1, maxLength: 255 },
        active: { type: 'boolean' },
        locked: { type: 'boolean' },
        name: { type: 'string', minLength: 1, maxLength: 255 },
        lastLogin: { type: 'string' },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' },
      },
    };
  }
}

module.exports = User;
