exports.up = function(knex) {
  return Promise.all([
    knex.schema.createTable('asset', table => {
      table
        .uuid('id')
        .notNullable()
        .unique()
        .primary();
      table.text('location');
      table.string('sha', 40).index();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      table
        .uuid('project_id')
        .index()
        .references('project.id')
        .onDelete('CASCADE');
      table
        .uuid('organization_id')
        .index()
        .references('organization.id')
        .onDelete('CASCADE');
    }),
    knex.schema.createTable('snapshot', table => {
      table
        .uuid('id')
        .notNullable()
        .unique()
        .primary();
      table.text('title');
      table.string('width');
      table.string('browser');
      table.string('selector');
      table.text('hide_selectors');
      table.text('source_location');
      table.text('image_location');
      table.string('sha', 40);
      table.text('relative_path');
      table.boolean('diff').defaultTo(false);
      table.boolean('approved').defaultTo(false);
      table.timestamp('approved_on');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      table
        .uuid('approved_by_id')
        .index()
        .references('organization_member.id')
        .onDelete('SET NULL');
      table
        .uuid('build_id')
        .index()
        .references('build.id')
        .onDelete('CASCADE');
      table
        .uuid('project_id')
        .index()
        .references('project.id')
        .onDelete('CASCADE');
      table
        .uuid('organization_id')
        .index()
        .references('organization.id')
        .onDelete('CASCADE');
      table
        .uuid('previous_approved_id')
        .index()
        .references('snapshot.id')
        .onDelete('CASCADE');
    }),
    knex.schema.createTable('snapshot_diff', table => {
      table
        .uuid('id')
        .notNullable()
        .unique()
        .primary();
      table.text('image_location');
      table.string('difference_amount');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      table
        .uuid('snapshot_from_id')
        .index()
        .references('snapshot.id')
        .onDelete('CASCADE');
      table
        .uuid('snapshot_to_id')
        .index()
        .references('snapshot.id')
        .onDelete('CASCADE');
      table
        .uuid('organization_id')
        .index()
        .references('organization.id')
        .onDelete('CASCADE');
    }),
  ]);
};

exports.down = function(knex) {
  return Promise.all([
    knex.schema.dropTable('snapshot_diff'),
    knex.schema.dropTable('snapshot'),
    knex.schema.dropTable('asset'),
  ]);
};
