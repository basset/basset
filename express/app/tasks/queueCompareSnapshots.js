const settings = require('../settings');
const messagesPerWorker = 300;

const getWorkers = count => {
  return Math.floor(count / messagesPerWorker) + 1;
};

const queueCompareSnapshots = async messages => {
  if (settings.sqs.use) {
    const aws = require('aws-sdk');
    const sqs = new aws.SQS({ apiVersion: '2012-11-05' });
    const batchedData = [];
    const sortedMessages = messages.sort((a, b) => a.browser > b.browser); // sort by browser
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
  } else {
    const amqp = require('amqplib');
    const connection = await amqp.connect(settings.ampq.host);
    const channel = await connection.createChannel();

    try {
      await channel.assertQueue(settings.ampq.buildQueue, { durable: true });

      for await (const messageData of messages) {
        const message = JSON.stringify(messageData);
        console.log('sending', message);
        await channel.sendToQueue(settings.ampq.buildQueue, Buffer.from(message), {
          deliveryMode: true,
        });
      }

      await channel.close();
      await connection.close();
    } catch (error) {
      console.error(error);
      await connection.close();
      throw error;
    }
  }
};


module.exports = {
  queueCompareSnapshots,
};
