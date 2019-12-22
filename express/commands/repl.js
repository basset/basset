const repl = require('repl');
const glob = require( 'glob');
const path = require( 'path');

const db = require('../app/db.js');
const knex = db.configure();

const models = {};
glob.sync('./app/models/**/*.js').forEach(file => {
 const required = require(path.resolve(file));
 if (required.name) {
   models[required.name] = required;
 }
});
console.log(`global 'knex' configured`);
console.log(`global 'models' configured`);
const replSession = repl.start('basset> ');

Object.defineProperties(replSession.context, {
  'knex': {
    configurable: false,
    enumerable: true,
    value: knex,
  },
  'models': {
    configurable: false,
    enumerable: true,
    value: models,
  }
});
