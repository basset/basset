const amqp = require('amqp-connection-manager');
const settings = require('../settings');


let connection;

const configureConnection = () => {
  if (settings.amqp.use && !process.env.TEST) {
    connection = amqp.connect([settings.amqp.host]);
  }
};

module.exports = {
  connection,
  configureConnection,
};