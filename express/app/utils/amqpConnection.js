const amqp = require('amqp-connection-manager');
const settings = require('../settings');

let connection;
if (settings.amqp.use && !process.env.TEST) { // selenium cannot run if amqplib is trying to reconnect
  connection = amqp.connect([settings.amqp.host]);
}

module.exports = connection;