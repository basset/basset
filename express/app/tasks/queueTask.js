const aws = require('aws-sdk');

const connection = require('../utils/amqpConnection');
const settings = require('../settings');
const actionTypes = require('./actionTypes');

let channelWrapper;
let sqs;

if (settings.sqs.use) {
  sqs = new aws.SQS({ apiVersion: '2012-11-05' });
} else {
  channelWrapper = connection.createChannel({
    setup: (channel) => channel.assertQueue(settings.amqp.taskQueue, { durable: true }),
  })
}

const queueTask = async message => {
  if (settings.sqs.use) {
    await sqs
      .sendMessage({
        QueueUrl: settings.sqs.taskUrl,
        MessageBody: JSON.stringify(message),
      })
      .promise();
  } else {
    const messageData = JSON.stringify(message);
    await channelWrapper.sendToQueue(
      settings.amqp.taskQueue,
      Buffer.from(messageData),
      {
        deliveryMode: true,
      },
    );
  }
};

const tasks = {
  monitorBuild: buildId => ({
    type: actionTypes.monitorBuild,
    data: {
      buildId,
    },
  }),
};

module.exports = {
  queueTask,
  tasks,
};
