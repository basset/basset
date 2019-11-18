const settings = require('../settings');
const messagesPerWorker = 300;

const getWorkers = count => {
  return Math.floor(count / messagesPerWorker) + 1;
};
let channelWrapper;
let sqs;

const configureQueue = () => {
  if (settings.sqs.use) {
    const aws = require('aws-sdk');
    sqs = new aws.SQS({apiVersion: '2012-11-05'});
  } else if (settings.amqp.use && !process.env.TEST) {
    const { connection } = require('../utils/amqpConnection');
    channelWrapper = connection.createChannel({
      setup: (channel) => channel.assertQueue(settings.amqp.buildQueue, {durable: true}),
    })
  }
};

const queueCompareSnapshots = async messages => {
  if (settings.sqs.use) {
    const batchedData = [];
    const sortedMessages = messages.sort((a, b) => a.browser - b.browser); // sort by browser
    for (let i = 0; i < sortedMessages.length; i += 10) {
      const messageId = getWorkers(i);
      const mapFn = m => ({
        Id: m.id,
        MessageBody: JSON.stringify(m),
        MessageGroupId: `${m.organizationId}-${m.buildId}-${messageId}`,
        MessageDeduplicationId: `${m.organizationId}-${m.id}`,
      });
      batchedData.push(sortedMessages.slice(i, i + 10).map(mapFn));
    }
    for await (const data of batchedData) {
      await sqs
        .sendMessageBatch({
          QueueUrl: settings.sqs.buildUrl,
          Entries: data,
        })
        .promise();
    }
    const jobName = `basset-${messages[0].organizationId}-${
      messages[0].buildId
    }`;
    const workerCount = getWorkers(messages.length);
    for await (_ of Array(workerCount)) {
      await new aws.Batch({ apiVersion: '2016-08-10' })
        .submitJob({
          jobDefinition: settings.awsBatch.JobDefinition,
          jobName,
          jobQueue: settings.awsBatch.jobQueue,
        })
        .promise();
    }
  } else if (settings.amqp.use) {
    const sortedMessages = messages.sort((a, b) => a.browser - b.browser);
    for await (const messageData of sortedMessages) {
      const message = JSON.stringify(messageData);
      await channelWrapper.sendToQueue(
        settings.amqp.buildQueue,
        Buffer.from(message),
        {
          deliveryMode: true,
        },
      );
    }
  }
};

module.exports = {
  queueCompareSnapshots,
  configureQueue,
};
