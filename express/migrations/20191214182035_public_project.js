
exports.up = async function(knex) {
  await knex.schema.table('project', table => {
    table.boolean('public').defaultTo(false).notNullable();
  });
  await knex.schema.table('organization', table => {
    table.boolean('allow_public_projects').defaultTo(false).notNullable();
  });
};

exports.down = async function(knex) {
  await knex.schema.table('project', table => {
    table.dropColumn('public');
  });
  await knex.schema.table('organization', table => {
    table.dropColumn('allow_public_projects')
  })
};
