const { Model } = require('objection');
const BaseModel = require('./BaseModel');

class Asset extends BaseModel {
  static get tableName() {
    return 'asset';
  }

  canRead(user) {
    return user.organizations.map(o => o.id).includes(this.organizationId);
  }

  static create(data) {
    return Asset.query().insert(data);
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
    const BuildAsset = require('./BuildAsset');
    return {
      organization: {
        relation: Model.BelongsToOneRelation,
        modelClass: Organization,
        join: {
          from: 'asset.organizationId',
          to: 'organization.id',
        },
      },
      project: {
        relation: Model.BelongsToOneRelation,
        modelClass: Project,
        join: {
          from: 'asset.projectId',
          to: 'project.id',
        },
      },
      buildAssets: {
        relation: Model.HasManyRelation,
        modelClass: BuildAsset,
        join: {
          from: 'asset.id',
          to: 'buildAsset.assetId',
        }
      }
    };
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: [],
      properties: {
        id: { type: 'string' },
      },
    };
  }
}

module.exports = Asset;
