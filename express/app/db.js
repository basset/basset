const Knex = require('knex');
const { Model, knexSnakeCaseMappers } = require('objection');
const settings = require('./settings');

const config = {
  ...settings.database,
  ...knexSnakeCaseMappers(),
};
const configure = () => {
  const knex = Knex({ ...settings.database, ...knexSnakeCaseMappers() });
  Model.knex(knex);
  return knex;
};

module.exports = {
  configure,
  Model,
  Knex,
  config,
};
