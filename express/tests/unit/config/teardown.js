module.exports = async function() {
  await global.knex.migrate.rollback();
  await global.knex.destroy();
};
