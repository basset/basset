const amqp = require('amqp-connection-manager');
const settings = require('../settings');

let connection;
if (!settings.sqs.use) {
  connection = amqp.connect([settings.amqp.host]);
}

module.exports = connection;