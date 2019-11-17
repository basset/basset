const settings = require('../settings');
const actionTypes = require('./actionTypes');

const queueTask = async message => {
  if (settings.sqs.use) {
    const aws = require('aws-sdk');
    const sqs = new aws.SQS({ apiVersion: '2012-11-05' });
    await sqs
      .sendMessage({
        QueueUrl: settings.sqs.taskUrl,
        MessageBody: JSON.stringify(message),
      })
      .promise();
  } else {
    const amqp = require('amqplib');
    const connection = await amqp.connect(settings.amqp.host);
    const channel = await connection.createChannel();

    try {
      await channel.assertQueue(settings.amqp.taskQueue, { durable: true });

      const messageData = JSON.stringify(message);
      await channel.sendToQueue(
        settings.amqp.taskQueue,
        Buffer.from(messageData),
        {
          deliveryMode: true,
        },
      );
      await channel.close();
      await connection.close();
    } catch (error) {
      console.error(error);
      await connection.close();
      throw error;
    }
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
