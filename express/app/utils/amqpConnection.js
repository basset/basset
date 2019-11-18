const amqp = require('amqp-connection-manager');
const settings = require('../settings');


let connection;

const getConnection = () => {
  if (connection) {
    return connection;
  }
  if (settings.amqp.use && !process.env.TEST) {
    connection = amqp.connect([settings.amqp.host]);
    return connection;
  }
};


module.exports = {
  getConnection,
};