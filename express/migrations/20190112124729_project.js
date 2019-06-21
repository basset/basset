exports.up = function(knex, Promise) {
  return knex.schema.createTable('project', table => {
    table
      .uuid('id')
      .notNullable()
      .unique()
      .primary();
    table.string('name').notNullable();
    table.string('key').notNullable();
    table.string('browsers').defaultTo('firefox');
    table.string('default_branch').defaultTo('master');
    table.string('default_width').defaultTo('1280');
    table.string('hide_selectors').defaultTo('');
    table.string('provider');
    table.string('repo_owner');
    table.string('repo_name');
    table.string('repo_token');
    table.boolean('repo_active');
    table.string('slack_webhook');
    table.string('slack_variable');
    table.boolean('slack_active');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table
      .uuid('organization_id')
      .index()
      .references('organization.id')
      .onDelete('CASCADE');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('project');
};
