const db = require('../app/db');

const knex = db.configure();
const main = async () => {
  const migrations = await knex.migrate.latest();
  console.log('migrations complete');
  knex.destroy();
};
main();
