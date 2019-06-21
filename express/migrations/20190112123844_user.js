exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('user', table => {
      table
        .uuid('id')
        .notNullable()
        .unique()
        .primary();
      table.string('email').notNullable();
      table.string('name');
      table.string('password');
      table.string('profile_image');
      table.boolean('active').defaultTo(false);
      table.boolean('admin').defaultTo(false);
      table.dateTime('last_login');
      table.boolean('locked').defaultTo(false);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      table.unique('email');
    }),
    knex.schema.createTable('user_provider', table => {
      table
        .uuid('id')
        .notNullable()
        .unique()
        .primary();
      table.string('provider').notNullable();
      table.string('provider_id').notNullable();
      table.string('token').notNullable();
      table
        .uuid('user_id')
        .index()
        .references('user.id')
        .onDelete('CASCADE');
      table.timestamp('created_at').defaultTo(knex.fn.now());
    }),
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('user_provider'),
    knex.schema.dropTable('user'),
  ]);
};
