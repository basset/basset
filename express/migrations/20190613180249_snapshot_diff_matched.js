
exports.up = function(knex, Promise) {
  return knex.schema.table('snapshot_diff', table => {
    table.string('sha', 40);
    table.integer('group');
    table
      .uuid('build_id')
      .index()
      .references('build.id')
      .onDelete('CASCADE');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('snapshot_diff', table => {
    table.dropColumn('sha');
    table.dropColumn('group');
  })
};
