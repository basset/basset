const faker = require('faker');
const crypto = require('crypto');

const { Model, knexSnakeCaseMappers } = require('objection');
const Knex = require('knex');
const knexConfig = require('../knexfile');
const knex = Knex({ ...knexConfig, ...knexSnakeCaseMappers() });

Model.knex(knex);

const Build = require('../app/models/Build');
const User = require('../app/models/User');
const Organization = require('../app/models/Organization');
//const OrganizationMember = require('../app/models/OrganizationMember');
const Project = require('../app/models/Project');
const { addUserToOrganization } = require('../app/utils/registration');
(async () => {
  const org = await Organization.query().insert({
    name: 'Test',
  });
  for (item of Array.from(Array(10))) {
    const name = faker.name.findName();
    const user = await User.query().insertAndFetch({
      profileImage: faker.image.avatar(),
      email: `${name
        .split(' ')
        .join('')
        .toLowerCase()}@basset.io`,
      password: 'basset',
      name,
      active: true,
    });
    const member = await addUserToOrganization(null, user, org.id);
  }
  for (item of Array.from(Array(2))) {
    const projectName = faker.random.word();
    const project = await Project.query().insert({
      name: projectName,
      organizationId: org.id,
    });
    for (item of Array.from(Array(5))) {
      const commitDate = faker.date.recent(1 + item);
      let minutes = commitDate.getMinutes() + faker.random.number(1, 5);
      const submittedAt = new Date(commitDate);
      submittedAt.setMinutes(minutes + 20);
      minutes = submittedAt.getMinutes() + faker.random.number(1, 5);
      const completedAt = new Date(submittedAt);
      completedAt.setMinutes(minutes + 5);

      await Build.query().insert({
        branch: faker.random.word(),
        commitSha: crypto.randomBytes(7).toString('hex'),
        commitMessage: faker.random.words(),
        committerName: faker.name.findName(),
        commitDate: commitDate.toISOString(),
        completedAt: completedAt.toISOString(),
        submittedAt: submittedAt.toISOString(),
        projectId: project.id,
        organizationId: org.id,
      });
    }
  }
  process.exit(0);
})();
