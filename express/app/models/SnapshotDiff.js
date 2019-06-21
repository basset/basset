const { Model } = require('objection');
const BaseModel = require('./BaseModel');

class SnapshotDiff extends BaseModel {
  static get tableName() {
    return 'snapshotDiff';
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
    const Snapshot = require('./Snapshot');
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
