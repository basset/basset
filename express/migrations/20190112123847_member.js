exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('organization_member', table => {
      table
        .uuid('id')
        .notNullable()
        .unique()
        .primary();
      table.boolean('active').defaultTo(true);
      table.boolean('admin').defaultTo(false);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      table
        .uuid('user_id')
        .index()
        .references('user.id')
        .onDelete('CASCADE');
      table
        .uuid('organization_id')
        .index()
        .references('organization.id')
        .onDelete('CASCADE');
    }),
    knex.schema.createTable('organization_invite', table => {
      table
        .uuid('id')
        .notNullable()
        .unique()
        .primary();
      table.string('token');
      table.string('email').notNullable();
      table.boolean('accepted');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      table
        .uuid('from_id')
        .index()
        .references('organization_member.id')
        .onDelete('CASCADE');
      table
        .uuid('organization_id')
        .index()
        .references('organization.id')
        .onDelete('CASCADE');
    }),
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('organization_invite'),
    knex.schema.dropTable('organization_member'),
  ]);
};
