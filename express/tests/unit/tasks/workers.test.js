const settings = require('.../../../app/settings');
settings.IS_TESTING = true;

const actionTypes = require('../../../app/tasks/actionTypes');

jest.mock('../../../app/tasks/builds', () => ({
  monitorBuildStatus: jest.fn(() => 'test'),
}));
jest.mock('aws-sdk', () => {
  return {
    SQS: jest.fn(() => ({
      sendMessage: jest.fn(),
      deleteMessage: jest.fn(),
    })),
  };
});
const builds = require('../../../app/tasks/builds');
const workers = require('../../../app/tasks/workers');

test('workers', async () => {
  let mockData = {
    Messages: [
      {
        Body: JSON.stringify({
          type: actionTypes.monitorBuild,
          data: { test: true },
        }),
        delete: jest.fn(),
      },
    ],
  };
  await workers.processSQSMessages(null, mockData);
  expect(builds.monitorBuildStatus).toHaveBeenCalledWith(
    expect.objectContaining({
      test: true,
    }),
  );
});
