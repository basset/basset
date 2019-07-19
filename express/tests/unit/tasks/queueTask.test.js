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

let mockSendMessage = jest.fn(() => ({
  promise: jest.fn(),
}));
jest.mock('aws-sdk', () => {
  return {
    SQS: jest.fn(() => ({
      sendMessage: mockSendMessage,
    })),
  };
});

const settings = require('.../../../app/settings');
const queueTask = require('../../../app/tasks/queueTask');

test('queueTask', async () => {
  settings.sqs.use = true;
  settings.sqs.taskUrl = 'taskurl';
  const message = { type: 'test', data: 'testing' };
  queueTask.queueTask(message);
  expect(mockSendMessage).toHaveBeenCalledWith(
    expect.objectContaining({
      QueueUrl: settings.sqs.taskUrl,
      MessageBody: JSON.stringify(message),
    }),
  );
});
