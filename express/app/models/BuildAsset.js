const { Model } = require('objection');
const BaseModel = require('./BaseModel');

class BuildAsset extends BaseModel {
  static get tableName() {
    return 'buildAsset';
  }

  canRead(user) {
    return user.organizations.map(o => o.id).includes(this.organizationId);
  }

  static create(data) {
    return BuildAsset.query().insert(data);
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
    const Asset = require('./Asset');
    return {
      organization: {
        relation: Model.BelongsToOneRelation,
        modelClass: Organization,
        join: {
          from: 'buildAsset.organizationId',
          to: 'organization.id',
        },
      },
      build: {
        relation: Model.BelongsToOneRelation,
        modelClass: Build,
        join: {
          from: 'buildAsset.buildId',
          to: 'build.id',
        },
      },
      asset: {
        relation: Model.BelongsToOneRelation,
        modelClass: Asset,
        join: {
          from: 'buildAsset.assetId',
          to: 'asset.id',
        },
      },
    };
  }
}

module.exports = BuildAsset;
