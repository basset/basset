
exports.up = async function(knex) {
  await knex.schema.table('project', table => {
    table.boolean('public').defaultTo(false).notNullable();
  });
};

exports.down = async function(knex) {
  await knex.schema.table('project', table => {
    table.dropColumn('public');
  })
};
