const aws = require('aws-sdk');

const settings = require('../settings');
const actionTypes = require('./actionTypes');

let sqs;

if (settings.sqs.use) {
  sqs = new aws.SQS({ apiVersion: '2012-11-05' });
}

const queueTask = async message => {
  if (settings.sqs.use) {
    await sqs
      .sendMessage({
        QueueUrl: settings.sqs.taskUrl,
        MessageBody: JSON.stringify(message),
      })
      .promise();
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
