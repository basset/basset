const { Model } = require('objection');
const BaseModel = require('./BaseModel');

class SnapshotFlake extends BaseModel {
  static get tableName() {
    return 'snapshotFlake';
  }

  async canRead(user) {
    const project = this.project || await this.$relatedQuery('project');
    if (project.public) {
      const organization = this.organization || await this.$relatedQuery('organization');
      return organization.allowPublicProjects;
    }
    if (!user) {
      return false;
    }
    return user.organizations.map(o => o.id).includes(this.organizationId);
  }

  static authorizationFilter(user) {
    const query = this
      .query()
      .joinRelation('project')
      .joinRelation('organization');

    if (!user) {
      return query
        .where('project.public', true)
        .where('organization.allowPublicProjects', true)
    }
    return query
      .where(builder =>
        builder
          .whereIn(
            'snapshotFlake.organizationId',
            user.organizations.map(o => o.id),
          )
          .orWhere(builder =>
            builder
              .where('project.public', true)
              .where('organization.allowPublicProjects', true)
          )
      )
  }

  static get relationMappings() {
    const Organization = require('./Organization');
    const OrganizationMember = require('./OrganizationMember');
    const Snapshot = require('./Snapshot');
    const SnapshotDiff = require('./SnapshotDiff');
    const Project = require('./Project');
    return {
      organizationMembers: {
        relation: Model.HasManyRelation,
        modelClass: OrganizationMember,
        join: {
          from: 'snapshotFlake.organizationId',
          to: 'organizationMember.organizationId',
        },
      },
      organization: {
        relation: Model.BelongsToOneRelation,
        modelClass: Organization,
        join: {
          from: 'snapshotFlake.organizationId',
          to: 'organization.id',
        },
      },
      project: {
        relation: Model.BelongsToOneRelation,
        modelClass: Project,
        join: {
          from: 'snapshotFlake.projectId',
          to: 'project.id',
        },
      },
      snapshot: {
        relation: Model.BelongsToOneRelation,
        modelClass: Snapshot,
        join: {
          from: 'snapshotFlake.snapshotFromId',
          to: 'snapshot.id',
        },
      },
      snapshotDiff: {
        relation: Model.BelongsToOneRelation,
        modelClass: SnapshotDiff,
        join: {
          from: 'snapshotFlake.snapshotDiffId',
          to: 'snapshotDiff.id',
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
        location: { type: 'string' },
      },
    };
  }
}

module.exports = SnapshotFlake;
