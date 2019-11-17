let mockSendToQueue = jest.fn(async () => {});
jest.mock('amqp-connection-manager', () => ({
  connect: jest.fn(() => ({
    createChannel: jest.fn(() => ({
      sendToQueue: mockSendToQueue,
    })),
  })),
}));

const tasks = require('../../../app/tasks/queueCompareSnapshots');

describe('queueCompareSnapshots', () => {
  test('it sends messages to amqplib', async () => {
    const messages = [{ test: 1 }, { test: 2 }, { test: 3 }];
    await tasks.queueCompareSnapshots(messages);
    expect(mockSendToQueue).toHaveBeenCalledTimes(3);
  });
});
