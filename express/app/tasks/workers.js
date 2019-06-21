const settings = require('../settings');
const db = require('../db');
const actionTypes = require('./actionTypes');
const buildTasks = require('./builds');
db.configure();

const run = () => {
  if (settings.sqs.use) {
    const aws = require('aws-sdk');
    const sqs = new aws.SQS({ apiVersion: '2012-11-05' });
    setImmediate(() => {
      sqs.receiveMessage(
        {
          QueueUrl: settings.sqs.taskUrl,
        },
        processSQSMessages,
      );
    }, 60 * 1000);
  }
};

const processSQSMessages = async (err, data) => {
  if (err) {
    console.error('Error retrieving messages', err);
  }
  const aws = require('aws-sdk');
  const sqs = new aws.SQS({ apiVersion: '2012-11-05' });
  if (data.Messages) {
    for await (message of data.Messages) {
      console.log(`received message`);
      await processMessage(JSON.parse(message.Body));
      const deleteParams = {
        QueueUrl: settings.sqs.taskUrl,
        ReceiptHandle: message.ReceiptHandle,
      };
      sqs.deleteMessage(deleteParams, (err, data) => {
        if (err) {
          console.error('Delete Error', err);
        }
      });
    }
  }
};

const processMessage = message => {
  console.log(`received message: ${message.type}`);
  if (handlers.hasOwnProperty(message.type)) {
    return handlers[message.type](message.data);
  } else {
    console.error(`Handler not found for type: ${message.type}`);
  }
};

const handlers = {
  [actionTypes.monitorBuild]: buildTasks.monitorBuildStatus,
};

if (!settings.IS_TESTING) {
  run();
}

module.exports = {
  processMessage,
  processSQSMessages,
  handlers,
};
