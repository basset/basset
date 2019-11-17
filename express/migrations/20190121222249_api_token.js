exports.up = function(knex) {
  return knex.schema.createTable('api_token', table => {
    table
      .uuid('id')
      .notNullable()
      .unique()
      .primary();
    table.string('secret_key', 36).notNullable();
    table.string('public_key', 36).notNullable();
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
    table
      .uuid('organization_member_id')
      .index()
      .references('organization_member.id')
      .onDelete('CASCADE');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('api_token');
};
