
exports.up = function(knex, Promise) {
  return knex.schema.createTable('build_asset', table => {
    table
      .uuid('id')
      .notNullable()
      .unique()
      .primary();
    table.text('relative_path').index();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table
      .uuid('asset_id')
      .index()
      .references('asset.id')
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
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('build_asset')
};
