exports.up = function (knex) {
  return knex.schema.table('organization', table => {
    table.integer('monthly_snapshot_limit').defaultTo(7500).notNullable();
    table.bool('enforce_snapshot_limit').defaultTo(false).notNullable();
    table.integer('snapshot_retention_period').defaultTo(45).notNullable();
    table.bool('enforce_snapshot_retention').defaultTo(false).notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.table('organization', table => {
    table.dropColumn('monthly_snapshot_limit');
    table.dropColumn('enforce_snapshot_limit');
    table.dropColumn('snapshot_retention_period');
    table.dropColumn('enforce_snapshot_retention');
  })
};
