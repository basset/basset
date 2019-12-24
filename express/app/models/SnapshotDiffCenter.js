const { Model } = require('objection');
const BaseModel = require('./BaseModel');

class SnapshotDiffCenter extends BaseModel {
  static get tableName() {
    return 'snapshotDiffCenter';
  }

  async canRead(user) {
    return user.organizations.map(o => o.id).includes(this.organizationId);
  }

  static authorizationFilter(user) {
    return this.query().whereIn(
      'organizationId',
      user.organizations.map(o => o.id),
    );
  }

  static get relationMappings() {
    const Organization = require('./Organization');
    const Build = require('./Build');
    const SnapshotDiff = require('./SnapshotDiff');
    return {
      organization: {
        relation: Model.BelongsToOneRelation,
        modelClass: Organization,
        join: {
          from: 'snapshotDiffCenter.organizationId',
          to: 'organization.id',
        },
      },
      snapshotDiff: {
        relation: Model.BelongsToOneRelation,
        modelClass: SnapshotDiff,
        join: {
          from: 'snapshotDiffCenter.snapshotDiffId',
          to: 'snapshotDiff.id',
        },
      },
      build: {
        relation: Model.BelongsToOneRelation,
        modelClass: Build,
        join: {
          from: 'snapshotDiffCenter.buildId',
          to: 'build.id',
        },
      },
    };
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: [],
      properties: {
        id: { type: 'string', format: 'uuid' },
      },
    };
  }
}

module.exports = SnapshotDiffCenter;
