exports.up = function(knex) {
  return knex.schema.createTable('organization', table => {
    table
      .uuid('id')
      .notNullable()
      .unique()
      .primary();
    table.string('name').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('organization');
};
