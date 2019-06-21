if (!process.env.CI) {
  require('./test-settings');
}
const { configure } = require('../../../app/db');

module.exports = async () => {
  const knex = await configure();
  try {
    await knex.migrate.rollback();
    await knex.migrate.latest();
  } catch (error) {
    console.log(error);
  }
  global.knex = knex;
};
