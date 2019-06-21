const fs = require('fs');
const util = require('util');
const app = require('../../../app/app');

const http = require('http');

const server = http.createServer(app);

server.listen(err => {
  if (err) {
    console.error(err);
    process.exit();
  }
  const address = server.address();
  app.set('port', address.port);
  const info = {
    address,
  };
  fs.writeFileSync(process.env.BASSET_CONFIG, JSON.stringify(info));
});
