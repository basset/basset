let mockSendToQueue = jest.fn(async () => {});
const mockConnectionClose = jest.fn(async () => {});
const mockChannelClose = jest.fn(async () => {});
jest.mock('amqplib', () => ({
  connect: jest.fn(async () => ({
    createChannel: jest.fn(async () => ({
      assertQueue: jest.fn(async () => {}),
      sendToQueue: mockSendToQueue,
      close: mockChannelClose,
    })),
    close: mockConnectionClose,
  })),
}));

const tasks = require('../../../app/tasks/queueCompareSnapshots');

describe('queueCompareSnapshots', () => {
  test('it sends messages to ampqlib', async () => {
    const messages = [{ test: 1 }, { test: 2 }, { test: 3 }];
    await tasks.queueCompareSnapshots(messages);
    expect(mockSendToQueue).toHaveBeenCalledTimes(3);
    expect(mockChannelClose).toHaveBeenCalledTimes(1);
    expect(mockConnectionClose).toHaveBeenCalledTimes(1);
  });
  it('should closes the channel and connection on an error', async () => {
    const messages = [{ test: 1 }, { test: 2 }, { test: 3 }];
    mockSendToQueue = () => {
      throw new Error('broken');
    };
    try {
      await tasks.queueCompareSnapshots(messages);
    } catch (error) {
      expect(mockChannelClose).toHaveBeenCalledTimes(1);
    }
  });
});
