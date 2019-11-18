const db = require('../app/db');
const User = require('../app/models/User');
const Organization = require('../app/models/Organization');

const knex = db.configure();

const main = async () => {
  const args = process.argv.slice(2);
  const [email, password, orgName] = args;
  if (!email || !password) {
    console.error('You must supply a email and password (in that order).');
    destroyAndExit();
  }
  // check user exists
  userExists = await User.query()
    .where('email', email)
    .first();
  if (userExists) {
    console.error('A user with this email already exists');
    destroyAndExit();
  }
  const user = await User.query().insertAndFetch({
    email,
    password,
    name: 'Name',
    active: true,
    admin: true,
  });
  if (!user) {
    console.error('There was an error creating the user');
    destroyAndExit();
  }

  console.log(`Successfully added user: ${email}`);
  if (orgName) {
    const org = await Organization.query().insertAndFetch({
      name: orgName,
    });
    if (!org) {
      console.error('There was an error creating the organization');
      destroyAndExit();
    }
    await user.$relatedQuery('organizationMemberships').insert({
      userId: user.id,
      organizationId: org.id,
      admin: true,
    });

    console.log(`Successfully added organization: ${orgName}`);
  }
  await knex.destroy();
};

const destroyAndExit = async () => {
  await knex.destroy();
  process.exitCode = 0;
};
main();
