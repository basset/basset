const { Model } = require('objection');
const uuidv4 = require('uuid/v4');

class BaseModel extends Model {
  $beforeInsert(queryContext) {
    this.id = uuidv4();
    return super.$beforeInsert(queryContext);
  }
  $beforeUpdate() {
    this.updatedAt = BaseModel.knex().fn.now();
  }
}

module.exports = BaseModel;
