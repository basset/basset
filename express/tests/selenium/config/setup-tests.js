if (!process.env.CI) {
  require('./test-settings');
}

const { configure } = require('../../../app/db');

let knex;
beforeAll(async () => {
  knex = configure();
});

afterAll(async () => {
  let tables = await knex('pg_tables')
    .select('tablename')
    .where('schemaname', 'public')
    .map(t => t.tablename);
  const ignore = ['knex_migrations', 'knex_migrations_lock'];
  tables = tables.filter(t => !ignore.includes(t));
  await knex.raw(`TRUNCATE TABLE "${tables.join('","')}"`);
  knex.destroy();
  await global.cleanup();
});
