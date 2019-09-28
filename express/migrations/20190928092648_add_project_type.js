exports.up = function(knex, Promise) {
  return knex.schema.table('project', table => {
    table
      .enu('type', ['web', 'image'], {
        useNative: true,
        enumName: 'project_type',
      })
      .defaultTo('web');
  });
};

exports.down = async function(knex) {
  await knex.schema.table('project', table => {
    table.dropColumn('type');
  })
  return knex.raw('DROP TYPE project_type');
};
