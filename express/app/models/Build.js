const { Model } = require('objection');

const BaseModel = require('./BaseModel');
const Snapshot = require('./Snapshot');
const SnapshotDiff = require('./SnapshotDiff');
const BuildAsset = require('./BuildAsset');
const { getPRs, getPR } = require('../integrations/github/pullRequest');
const { notifySnapshotsNeedApproving } = require('../integrations/slack/slack');
const { queueCompareSnapshots } = require('../tasks/queueCompareSnapshots');
const { queueTask, tasks } = require('../tasks/queueTask');

class Build extends BaseModel {
  async $beforeInsert(context) {
    const build = await Build.query()
      .max('number as last')
      .where('organizationId', this.organizationId)
      .andWhere('projectId', this.projectId)
      .first();
    this.number = (build.last || 0) + 1;
    return super.$beforeInsert(context);
  }

  static get tableName() {
    return 'build';
  }

  async canRead(user) {
    if (!user) {
      const project = this.project || await this.$relatedQuery('project');
      return project.public;
    }
    return user.organizations.map(o => o.id).includes(this.organizationId);
  }

  async canEdit(user) {
    return this.canRead(user);
  }

  async canDelete(user) {
    return true;
  }

  async canCreate(user) {
    return true;
  }

  static async create(data) {
    return Build.query().insert(data);
  }

  static authorizationFilter(user) {
    if (user) {
      return this
        .query()
        .joinRelation('project')
        .whereIn(
          'build.organizationId',
          user.organizations.map(o => o.id),
          );


    }
    return this
      .query()
      .joinRelation('project')
      .where('project.public', true);
  }

  async notifyPending(project = null) {
    if (!project) {
      project = await this.$relatedQuery('project');
    }
    if (project.hasSCM) {
      project.scm.snapshotsPending(project, this);
    }
  }

  async notifyApproved(trx, project = null) {
    if (!project) {
      project = await this.$relatedQuery('project');
    }
    if (project.hasSCM) {
      project.scm.snapshotsApproved(project, this);
    }
    await this.$query(trx).update({
      buildVerified: true,
    });
  }

  async notifyChanges(modifiedSnapshotCount, project = null) {
    if (!project) {
      project = await this.$relatedQuery('project');
    }
    if (project.hasSCM) {
      project.scm.snapshotsNeedApproving(project, this);
    }
    if (project.hasSlack) {
      notifySnapshotsNeedApproving(modifiedSnapshotCount, project, this);
    }
  }

  async notifySnapshotsExceeded(trx = null, project = null) {
    if (!project) {
      project = await this.$relatedQuery('project');
    }
    await this.$query(trx).update({
      error: true,
    });
    if (project.hasSCM) {
      project.scm.snapshotsExceeded(project, this);
    }
  }

  async notifyNoChanges(trx = null, project = null) {
    if (!project) {
      project = await this.$relatedQuery('project');
    }
    await this.$query(trx).update({
      buildVerified: true,
    });
    if (project.hasSCM) {
      project.scm.snapshotsNoDiffs(project, this);
    }
  }

  async getPreviousBuild({ project = null, compareBranch = null } = {}) {
    if (!project) {
      project = await this.$relatedQuery('project');
    }
    let isPR = false;
    let baseSHA = null;
    let baseBuild = null;

    if (project.hasSCM && this.commitSha && (compareBranch || this.branch)) {
      this.notifyPending(project);
      baseSHA = await project.scm.getBaseSHA(project, this.commitSha);
      if (baseSHA) {
        isPR = true;
      }
    }
    const baseQuery = Build.query()
      .where('projectId', this.projectId)
      .where('buildVerified', true)
      .whereNotNull('completedAt')
      .orderBy('completedAt', 'desc')
      .first();

    if (isPR) {
      baseBuild = await baseQuery
        .clone()
        .where('branch', compareBranch || this.branch);

      if (!baseBuild && baseSHA) {
        baseBuild = await baseQuery.clone().where('commitSha', baseSHA);
      }
    }
    if (!baseBuild) {
      baseBuild = await baseQuery
        .clone()
        .where('branch', compareBranch || project.defaultBranch);
    }
    if (!baseBuild && !isPR) {
      baseBuild = await baseQuery
        .clone()
        .where('branch', compareBranch || this.branch);
    }

    return baseBuild;
  }

  async compareSnapshots() {
    await this.$query().update({
      submittedAt: Build.knex().fn.now(),
    });
    const snapshots = await this.$relatedQuery('snapshots');
    const messages = [];
    for await (const snapshot of snapshots) {
      let previousApprovedSnapshot;
      if (this.previousBuildId) {
        previousApprovedSnapshot = await Snapshot.query()
          .where('title', snapshot.title)
          .where('width', snapshot.width)
          .where('browser', snapshot.browser)
          .whereNot('id', snapshot.id)
          .where('buildId', this.previousBuildId)
          .where(builder => {
            builder
              .where('approved', true)
              .orWhere('diff', false)
              .orWhere('flake', true);
          })
          .first();
        if (previousApprovedSnapshot && previousApprovedSnapshot.flake) {
          // always use the previousApproved for a flake
          // this way we're always using the approved/new diff the flake compared against
          previousApprovedSnapshot = await previousApprovedSnapshot.$relatedQuery(
            'previousApproved',
          );
        }
      }
      const messageData = {
        id: snapshot.id,
        title: snapshot.title,
        sourceLocation: snapshot.sourceLocation,
        hideSelectors: snapshot.hideSelectors,
        selector: snapshot.selector,
        width: snapshot.width,
        browser: snapshot.browser,
        buildId: this.id,
        organizationId: this.organizationId,
        projectId: this.projectId,
      };
      if (previousApprovedSnapshot) {
        await snapshot.$query().update({
          previousApprovedId: previousApprovedSnapshot.id,
        });
        messageData['compareSnapshot'] = previousApprovedSnapshot.imageLocation;
      }
      const snapshotFlakes = await snapshot
        .$relatedQuery('snapshotFlakes')
        .map(flake => flake.sha);
      messageData['flakeShas'] = snapshotFlakes;

      messages.push(messageData);
    }
    console.log('comparing snapshots');
    await queueCompareSnapshots(messages);
  }

  async started() {
    await this.notifyPending();
    await queueTask(tasks.monitorBuild(this.id));
  }

  async groupDiffs(trx = null) {
    const matches = await SnapshotDiff.query(trx)
      .select('sha')
      .where('buildId', this.id)
      .groupBy('sha')
      .having(Build.knex().raw('count(*) > 1'))
      .map(diff => diff.sha);

    for await (const [index, sha] of matches.entries()) {
      const group = index + 1;
      await this.$relatedQuery('snapshotDiffs', trx)
        .update({ group })
        .where('sha', sha);
    }
  }

  async compared(trx = null) {
    await this.$query(trx).update({
      completedAt: Build.knex().fn.now(),
    });
    const modifiedSnapshotCount = await Snapshot.getModifiedFromBuild(
      trx,
      this.id,
    );

    if (modifiedSnapshotCount > 0) {
      await this.notifyChanges(modifiedSnapshotCount);
    } else {
      await this.notifyNoChanges(trx);
    }
  }

  async createAssets(project, assets) {
    for await (const [relativePath, sha] of Object.entries(assets)) {
      const asset = await project
        .$relatedQuery('assets')
        .where('sha', sha)
        .first();

      await BuildAsset.create({
        relativePath,
        assetId: asset.id,
        buildId: this.id,
        organizationId: this.organizationId,
      });
    }
  }

  static get relationMappings() {
    const Organization = require('./Organization');
    const OrganizationMember = require('./OrganizationMember');
    const Project = require('./Project');
    const Asset = require('./Asset');
    return {
      previousBuild: {
        relation: Model.HasOneRelation,
        modelClass: Build,
        join: {
          from: 'build.previousBuildId',
          to: 'build.id',
        },
      },
      organizationMembers: {
        relation: Model.HasManyRelation,
        modelClass: OrganizationMember,
        join: {
          from: 'build.organizationId',
          to: 'organizationMember.organizationId',
        },
      },
      organization: {
        relation: Model.BelongsToOneRelation,
        modelClass: Organization,
        join: {
          from: 'build.organizationId',
          to: 'organization.id',
        },
      },
      project: {
        relation: Model.BelongsToOneRelation,
        modelClass: Project,
        join: {
          from: 'build.projectId',
          to: 'project.id',
        },
      },
      snapshots: {
        relation: Model.HasManyRelation,
        modelClass: Snapshot,
        join: {
          from: 'build.id',
          to: 'snapshot.buildId',
        },
      },
      snapshotDiffs: {
        relation: Model.HasManyRelation,
        modelClass: SnapshotDiff,
        join: {
          from: 'build.id',
          to: 'snapshotDiff.buildId',
        },
      },
      buildAssets: {
        relation: Model.HasManyRelation,
        modelClass: BuildAsset,
        join: {
          from: 'build.id',
          to: 'buildAsset.buildId',
        },
      },
      assets: {
        relation: Model.ManyToManyRelation,
        modelClass: Asset,
        join: {
          from: 'build.id',
          through: {
            from: 'buildAsset.buildId',
            to: 'buildAsset.assetId',
          },
          to: 'asset.id',
        },
      }
    };
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: [],
      properties: {
        id: { type: 'integer' },
        branch: { type: 'string', minLength: 1, maxLength: 255 },
        commitSha: { type: 'string', minLength: 1, maxLength: 255 },
        commitMessage: { type: 'string' },
        committerName: { type: 'string', minLength: 1, maxLength: 255 },
        committerEmail: { type: 'string', minLength: 1, maxLength: 255 },
        committerDate: { type: 'string' },
        authorName: { type: 'string', minLength: 1, maxLength: 255 },
        authorEmail: { type: 'string', minLength: 1, maxLength: 255 },
        authorDate: { type: 'string' },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' },
        completedAt: { type: 'string, null' },
        cancelledAt: { type: 'string, null' },
      },
    };
  }
}

module.exports = Build;
