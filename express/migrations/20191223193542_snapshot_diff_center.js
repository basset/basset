exports.up = async function (knex) {
  await knex.schema.createTable('snapshot_diff_center', table => {
    table
      .uuid('id')
      .notNullable()
      .unique()
      .primary();
    table.float('x').nullable();
    table.float('y').nullable();
    table.float('radius').nullable();
    table
      .uuid('snapshot_diff_id')
      .index()
      .references('snapshot_diff.id')
      .onDelete('CASCADE');
    table
      .uuid('build_id')
      .index()
      .references('build.id')
      .onDelete('CASCADE');
    table
      .uuid('organization_id')
      .index()
      .references('organization.id')
      .onDelete('CASCADE');
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTable('snapshot_diff_center');
};
