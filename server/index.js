const express = require('express');
const app = express();

const server = require('http').createServer(app);

server.listen(3000, () => {
  console.log('Node app start at port 1717');
});
