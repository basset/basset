const { Model } = require('objection');
const BaseModel = require('./BaseModel');
const settings = require('../settings');

class Organization extends BaseModel {
  static get tableName() {
    return 'organization';
  }

  async canRead(user) {
    return user.organizations.map(o => o.id).includes(this.id);
  }

  async canEdit(user) {
    return this.canDelete(user);
  }

  async canDelete(user) {
    if (settings.site.private) {
      return user.admin;
    }
    return user.isAdmin(this.id);
  }

  async canCreate(user) {
    return user.canCreateOrganizations();
  }

  static authorizationFilter(user) {
    return this.query().whereIn('id', user.organizations.map(o => o.id));
  }

  async snapshotLimitExceeded() {
    if (!this.enforceSnapshotLimit) {
      return false;
    }
    const count = await this.currentSnapshotCount;
    return count >= this.monthlySnapshotLimit;
  }

  get currentSnapshotCount() {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const lastOfMonth = new Date(year, month + 1, 0);
    return this
      .$query()
      .joinRelation('snapshots')
      .whereBetween('snapshots.createdAt', [ firstOfMonth, lastOfMonth ])
      .count()
      .then(({ count }) => count);
  }

  static get relationMappings() {
    const User = require('./User');
    const OrganizationMember = require('./OrganizationMember');
    const Project = require('./Project');
    const Snapshot = require('./Snapshot');
    return {
      organizationMembers: {
        relation: Model.HasManyRelation,
        modelClass: OrganizationMember,
        join: {
          from: 'organization.id',
          to: 'organizationMember.organizationId',
        },
        filter: {
          active: true,
        },
      },
      users: {
        relation: Model.ManyToManyRelation,
        modelClass: User,
        join: {
          from: 'organization.id',
          through: {
            from: 'organizationMember.organizationId',
            to: 'organizationMember.userId',
          },
          to: 'user.id',
        },
      },
      projects: {
        relation: Model.HasManyRelation,
        modelClass: Project,
        join: {
          from: 'organization.id',
          to: 'project.organizationId',
        },
      },
      snapshots: {
        relation: Model.HasManyRelation,
        modelClass: Snapshot,
        join: {
          from: 'organization.id',
          to: 'snapshot.organizationId',
        }
      }
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

module.exports = Organization;
