const crypto = require('crypto');
const { Model } = require('objection');
const BaseModel = require('./BaseModel');
const Asset = require('./Asset');
const { getSCM } = require('../integrations/scm');

class Project extends BaseModel {
  $beforeInsert(queryContext) {
    this.key = crypto.randomBytes(16).toString('hex');
    return super.$beforeInsert(queryContext);
  }

  static get TYPE() {
    return {
      WEB: 'web',
      IMAGE: 'image',
    };
  }

  static get allowedBrowsers() {
    return ['firefox', 'chrome'];
  }

  static get tableName() {
    return 'project';
  }

  static get scmProviderKeys() {
    return ['repoOwner', 'repoName', 'repoSlug', 'username', 'projectId'];
  }

  get hasSlack() {
    return (
      !!this.slackActive &&
      !!this.slackWebhook &&
      this.slackWebhook.trim() !== ''
    );
  }

  get hasSCM() {
    return (
      !!this.scmActive &&
      !!this.scmConfig &&
      !!this.scmProvider &&
      this.scmProvider.trim() !== ''
    );
  }

  get scm() {
    return getSCM(this);
  }

  get hasToken() {
    return !!this.scmToken && this.scmToken.trim() !== '';
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

  async getMissingAssets(assets) {
    const foundAssets = await this.$relatedQuery('assets')
      .select('sha')
      .whereIn('sha', Object.values(assets))
      .whereNotNull('location');

    // reverse path: sha to sha: path to remove duplicates
    const assetsBySha = Object.entries(assets).reduce((result, [path, sha]) => {
      result[sha] = path;
      return result;
    }, {});

    const assetByShaEntries = Object.entries(assetsBySha);

    const missingAssets = assetByShaEntries.filter(
      ([sha, _]) => !foundAssets.find(asset => asset.sha === sha),
    );

    return missingAssets.reduce((result, [sha, path]) => {
      result[path] = sha;
      return result;
    }, {});
  }

  async createAssets(assets) {
    for await (const sha of Object.values(assets)) {
      const assetExists = await this.$relatedQuery('assets')
        .where('sha', sha)
        .first(); // ignore duplicates
      if (!assetExists) {
        await Asset.create({
          sha,
          projectId: this.id,
          organizationId: this.organizationId,
        });
      }
    }
  }
  static async updateSCMToken(trx, user, providerRow, token) {
    const organizations = await user.$relatedQuery('organizations');
    return this.query(trx)
      .whereIn('project.organizationId', organizations.map(o => o.id))
      .where('scmToken', providerRow.token)
      .andWhere('scmProvider', providerRow.provider)
      .update({
        scmToken: token,
      });
  }
  static authorizationFilter(user) {
    return this.query().whereIn(
      'project.organizationId',
      user.organizations.map(o => o.id),
    );
  }

  static get relationMappings() {
    const Organization = require('./Organization');
    const OrganizationMember = require('./OrganizationMember');
    const Build = require('./Build');
    const Asset = require('./Asset');
    return {
      organizationMembers: {
        relation: Model.HasManyRelation,
        modelClass: OrganizationMember,
        join: {
          from: 'project.organizationId',
          to: 'organizationMember.organizationId',
        },
      },
      organization: {
        relation: Model.BelongsToOneRelation,
        modelClass: Organization,
        join: {
          from: 'project.organizationId',
          to: 'organization.id',
        },
      },
      builds: {
        relation: Model.HasManyRelation,
        modelClass: Build,
        join: {
          from: 'project.id',
          to: 'build.projectId',
        },
      },
      assets: {
        relation: Model.HasManyRelation,
        modelClass: Asset,
        join: {
          from: 'project.id',
          to: 'asset.projectId',
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

module.exports = Project;
