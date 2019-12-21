const { Model } = require('objection');
const BaseModel = require('./BaseModel');

class SnapshotDiff extends BaseModel {
  static get tableName() {
    return 'snapshotDiff';
  }

  async canRead(user) {
    if (!user) {
      const project = this.project || await this.$relatedQuery('project');
      if (project.public) {
        const organization = this.organization || await this.$relatedQuery('organization');
        return organization.allowPublicProjects;
      }
    }
    return user.organizations.map(o => o.id).includes(this.organizationId);
  }

  static authorizationFilter(user) {
    if (!user) {
      return this.query()
        .joinRelation('project')
        .joinRelation('organization')
        .where('project.public', true)
        .where('organization.allowPublicProjects', true)
    }
    return this.query().whereIn(
      'organizationId',
      user.organizations.map(o => o.id),
    );
  }

  static get relationMappings() {
    const Organization = require('./Organization');
    const Snapshot = require('./Snapshot');
    const Project = require('./Project');
    return {
      organization: {
        relation: Model.BelongsToOneRelation,
        modelClass: Organization,
        join: {
          from: 'snapshotDiff.organizationId',
          to: 'organization.id',
        },
      },
      snapshotFrom: {
        relation: Model.BelongsToOneRelation,
        modelClass: Snapshot,
        join: {
          from: 'snapshotDiff.snapshotFromId',
          to: 'snapshot.id',
        },
      },
      snapshotTo: {
        relation: Model.BelongsToOneRelation,
        modelClass: Snapshot,
        join: {
          from: 'snapshotDiff.snapshotToId',
          to: 'snapshot.id',
        },
      },
      project: {
        relation: Model.HasOneThroughRelation,
        modelClass: Project,
        join: {
          from: 'snapshotDiff.snapshotFromId',
          through: {
            from: 'snapshot.id',
            to: 'snapshot.projectId',
          },
          to: 'project.id'
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
        location: { type: 'string' },
      },
    };
  }
}

module.exports = SnapshotDiff;
