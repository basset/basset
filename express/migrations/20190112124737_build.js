exports.up = function(knex) {
  return knex.schema.createTable('build', table => {
    table
      .uuid('id')
      .notNullable()
      .unique()
      .primary();
    table.boolean('error').defaultTo;
    table.integer('number');
    table.string('branch');
    table.string('commit_sha');
    table.text('commit_message');
    table.string('committer_name');
    table.string('committer_email');
    table.timestamp('commit_date');
    table.string('author_name');
    table.string('author_email');
    table.boolean('build_verified').defaultTo(false);
    table.timestamp('author_date');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.timestamp('submitted_at');
    table.timestamp('completed_at');
    table.timestamp('cancelled_at');
    table
      .uuid('previous_build_id')
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
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('build');
};
