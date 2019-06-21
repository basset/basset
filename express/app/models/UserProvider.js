const { Model } = require('objection');
const BaseModel = require('./BaseModel');

class UserProvider extends BaseModel {
  static get tableName() {
    return 'userProvider';
  }

  static authorizationFilter(user) {
    return this.query()
      .joinRelation('organizations')
      .whereIn('organizations.id', user.organizations.map(o => o.id));
  }

  $beforeUpdate() {} // stop updatedAt

  static get relationMappings() {
    const User = require('./User');
    const Organization = require('./Organization');
    const OrganizationMember = require('./OrganizationMember');
    return {
      organizations: {
        relation: Model.ManyToManyRelation,
        modelClass: Organization,
        join: {
          from: 'userProvider.userId',
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
          from: 'userProvider.userId',
          to: 'organizationMember.userId',
        },
      },
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'userProvider.userId',
          to: 'user.id',
        },
      },
    };
  }
}

module.exports = UserProvider;
