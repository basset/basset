let mockSendToQueue = jest.fn(async () => {});

jest.mock('../../../app/utils/amqpConnection', () => ({
  getConnection: () => ({
    createChannel: jest.fn(() => ({
      sendToQueue: mockSendToQueue,
    })),
  }),
}))
const tasks = require('../../../app/tasks/queueCompareSnapshots');

describe('queueCompareSnapshots', () => {
  test('it sends messages to amqplib', async () => {
    tasks.configureQueue();
    const messages = [{ test: 1 }, { test: 2 }, { test: 3 }];
    await tasks.queueCompareSnapshots(messages);
    expect(mockSendToQueue).toHaveBeenCalledTimes(3);
  });
});
