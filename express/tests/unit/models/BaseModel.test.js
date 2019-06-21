jest.mock('uuid/v4', () => jest.fn(() => '1234'));
jest.mock('knex');

jest.mock('../../../app/models/BaseModel', () => {
  const BaseModel = require.requireActual('../../../app/models/BaseModel');
  BaseModel.knex = jest.fn(() => ({
    fn: {
      now: jest.fn(() => 'updatedTime'),
    },
  }));
  return BaseModel;
});
const uuid = require('uuid/v4');
const BaseModel = require('../../../app/models/BaseModel');

describe('BaseModel', () => {
  it('should create an uuid when inserting', async () => {
    const model = new BaseModel();
    model.$beforeInsert({});
    expect(model.id).toBe('1234');
    expect(uuid).toHaveBeenCalled();
  });
  it('should set updatedAt to now before an update', async () => {
    const model = new BaseModel();
    expect(model.updatedAt).toBeUndefined();
    model.$beforeUpdate();
    expect(model.updatedAt).toBe('updatedTime');
  });
});
