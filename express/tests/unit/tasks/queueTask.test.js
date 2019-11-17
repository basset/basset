let mockSendToQueue = jest.fn(async () => {});

jest.mock('amqp-connection-manager', () => ({
  connect: jest.fn(async () => ({
    createChannel: jest.fn(async () => ({
      sendToQueue: mockSendToQueue,
    })),
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

test('queueTask', async () => {
  const settings = require('.../../../app/settings');
  settings.sqs.use = true;
  settings.sqs.taskUrl = 'taskurl';
  const queueTask = require('../../../app/tasks/queueTask');
  const message = { type: 'test', data: 'testing' };
  queueTask.queueTask(message);
  expect(mockSendMessage).toHaveBeenCalledWith(
    expect.objectContaining({
      QueueUrl: settings.sqs.taskUrl,
      MessageBody: JSON.stringify(message),
    }),
  );
});
