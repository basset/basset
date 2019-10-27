const Project = require('../models/Project');
const Organization = require('../models/Organization');

const { paginateQuery } = require('../utils/graphql/paginate');
const { getModelLoader, primeLoaders } = require('../utils/graphql/dataloader');

const typeDefs = `
type SCMConfig {
  repoName: String
  repoOwner: String
  projectId: String
  username: String
  repoSlug: String
}
type Project implements Node {
  id: ID!
  name: String
  key: String
  scmProvider: String
  scmConfig: SCMConfig
  scmActive: Boolean
  hasToken: Boolean
  defaultBranch: String
  defaultWidth: String
  browsers: String
  slackActive: Boolean
  slackWebhook: String
  slackVariable: String
  hideSelectors: String
  organization: Organization
  organizationId: ID
}
type ProjectConnection {
  pageInfo: PageInfo!
  edges: [ProjectEdge]
  totalCount: Int
}
type ProjectEdge {
  cursor: String!
  node: Project
}
extend type Query {
  projects(first: Int, last: Int, after: String, before: String, organizationId: ID!): ProjectConnection @authField @cost(multipliers: ["first", "last"], complexity: 1)
  project(id: ID!): Project @authField
}

input SCMConfigInput {
  repoName: String
  repoOwner: String
  projectId: String
  username: String
  repoSlug: String
}
input ProjectInput {
  name: String
  scmProvider: String
  scmConfig: SCMConfigInput
  scmActive: Boolean
  defaultBranch: String
  defaultWidth: String
  browsers: String
  slackActive: Boolean
  slackWebhook: String
  slackVariable: String
  hideSelectors: String
}
extend type Mutation {
  unlinkProviderToProject(id: ID!, provider: String): Project @authField
  linkProviderToProject(id: ID!, provider: String!): Project @authField
  createProject(name: String!, organizationId: ID!): Project @authField
  editProject(id: ID!, projectInput: ProjectInput): Project @authField
  deleteProject(id: ID!): Boolean @authField
}
`;

const resolvers = {
  Query: {
    project: async (object, { id }, context, info) => {
      const { user } = context.req;
      const project = await getModelLoader(context, Project).load(id);
      if (await project.canRead(user)) {
        return project;
      }
      return null;
    },
    projects: async (object, { organizationId, ...args }, context, info) => {
      const { user } = context.req;
      const query = Project.authorizationFilter(user).where(
        'project.organizationId',
        organizationId,
      );
      return paginateQuery(context, query, {
        ...args,
        orderByPrefix: 'project',
      });
    },
  },
  Project: {
    organization: (project, args, context, info) =>
      getModelLoader(context, Organization).load(project.organizationId),
  },
  Mutation: {
    createProject: async (object, { name, organizationId }, context, info) => {
      const { user } = context.req;

      const organization = await Organization.authorizationFilter(
        user,
      ).findById(organizationId);

      if (!organization) {
        throw new Error(
          'Organization does not exist or you do not have permission to create projects.',
        );
      }
      const project = Project.fromJson({
        name,
        organizationId,
      });

      if (!(await project.canCreate(user))) {
        throw new Error('You do not have permission to create projects.');
      }
      return project.$query().insertAndFetch(project);
    },
    deleteProject: async (object, { id }, context, info) => {
      const { user } = context.req;

      const project = await Project.authorizationFilter(user).findById(id);

      if (!project) {
        throw new Error(
          'Project does not exist or you do not have permission to delete projects.',
        );
      }

      if (!(await project.canDelete(user))) {
        throw new Error('You do not have permission to delete projects.');
      }
      return project.$query().delete();
    },
    linkProviderToProject: async (object, { id, provider }, context, info) => {
      const { user } = context.req;

      const project = await Project.authorizationFilter(user).findById(id);

      if (!project) {
        throw new Error(
          'Project does not exist or you do not have permission to edit projects.',
        );
      }

      if (!(await project.canEdit(user))) {
        throw new Error('You do not have permission to edit projects.');
      }

      const { token } = await user
        .$relatedQuery('providers')
        .where('scmProvider', provider)
        .orderBy('createdAt')
        .first();
      if (!token) {
        throw new Error(`You do not have a ${provider} integration setup`);
      }
      return project.$query().updateAndFetch({
        scmToken: token,
        scmProvider: provider,
      });
    },
    unlinkProviderToProject: async (
      object,
      { id, provider },
      context,
      info,
    ) => {
      const { user } = context.req;

      const project = await Project.authorizationFilter(user).findById(id);

      if (!project) {
        throw new Error(
          'Project does not exist or you do not have permission to edit projects.',
        );
      }

      if (!(await project.canEdit(user))) {
        throw new Error('You do not have permission to edit projects.');
      }

      return project.$query().updateAndFetch({
        scmToken: null,
        scmProvider: null,
      });
    },
    editProject: async (object, { id, projectInput }, context, info) => {
      const { user } = context.req;

      const project = await Project.authorizationFilter(user).findById(id);

      if (!project) {
        throw new Error(
          'Project does not exist or you do not have permission to edit projects.',
        );
      }

      if (!(await project.canEdit(user))) {
        throw new Error('You do not have permission to edit projects.');
      }

      const scmConfig = projectInput.scmConfig || project.scmConfig;

      return project.$query().updateAndFetch({
        name: projectInput.name || project.name,
        scmConfig: JSON.stringify(scmConfig),
        scmActive: projectInput.hasOwnProperty('scmActive')
          ? projectInput.scmActive
          : project.scmActive,
        defaultBranch: projectInput.defaultBranch || project.defaultBranch,
        defaultWidth: projectInput.defaultWidth || project.defaultWidth,
        browsers: projectInput.browsers || project.browsers,
        slackWebhook: projectInput.slackWebhook || project.slackWebhook,
        slackActive: projectInput.hasOwnProperty('slackActive')
          ? projectInput.slackActive
          : project.slackActive,
        slackVariable: projectInput.slackVariable || project.slackVariable,
        hideSelectors: projectInput.hideSelectors || project.hideSelectors,
      });
    },
  },
};

module.exports = {
  typeDefs,
  resolvers,
};
