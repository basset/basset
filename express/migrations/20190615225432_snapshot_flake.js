exports.up = function(knex) {
  return Promise.all([
    knex.schema.createTable('snapshot_flake', table => {
      table
        .uuid('id')
        .notNullable()
        .unique()
        .primary();
      table.text('title');
      table.boolean('enabled').defaultTo(true);
      table.string('width');
      table.string('sha', 40);
      table.text('image_location');
      table.integer('match_count').defaultTo(0);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      table
        .uuid('created_by_id')
        .index()
        .references('organization_member.id')
        .onDelete('SET NULL');
      table
        .uuid('snapshot_id')
        .index()
        .references('snapshot.id')
        .onDelete('CASCADE');
      table
        .uuid('snapshot_diff_id')
        .index()
        .references('snapshot_diff.id')
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
    }),
    knex.schema.table('snapshot', table => {
      table
        .uuid('snapshot_flake_matched_id')
        .index()
        .references('snapshot_flake.id')
        .onDelete('SET NULL');
      table.boolean('flake').defaultTo(false);
    }),
  ]);
};

exports.down = function(knex) {
  return knex.schema
    .table('snapshot', table => {
      table.dropColumn('snapshot_flake_matched_id');
      table.dropColumn('flake');
    })
    .then(() => {
      return knex.schema.dropTable('snapshot_flake');
    });
};
