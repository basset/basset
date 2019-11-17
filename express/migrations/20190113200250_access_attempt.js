exports.up = function(knex) {
  return Promise.all([
    knex.schema.createTable('access_attempt', table => {
      table
        .uuid('id')
        .notNullable()
        .unique()
        .primary();
      table.string('email');
      table.string('user_agent');
      table.string('ip_address');
      table.integer('failure_attempt');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    }),
    knex.schema.createTable('access_log', table => {
      table
        .uuid('id')
        .notNullable()
        .unique()
        .primary();
      table.string('email');
      table.string('user_agent');
      table.string('ip_address');
      table.timestamp('logout_time');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    }),
  ]);
};

exports.down = function(knex) {
  return Promise.all([
    knex.schema.dropTable('access_attempt'),
    knex.schema.dropTable('access_log'),
  ]);
};
