'use strict';
const mongoose = require('mongoose');
const config = { host: (process.env.DB_HOST || require('./secret.js').host).trim() };

let connected = false;

exports.connect = function() {
  if (!connected) {
    console.log("> [INFO] \x1b[36mConnecting to mongodb database...\x1b[0m");
    mongoose.connect(config.host);
    console.log("> [INFO] \x1b[42mConnected to mongodb database!\x1b[0m")
    return connected = true;
  }
  console.log("> [WARNING] Already connected to mongod database.")
  return connected = true;
};

/*
'use strict';
const mongoose = require('mongoose');

const config = { host: process.env.DB_HOST } || require('./secret.js');

let connected = false;

exports.connect = function() {
  if (!connected) {
    console.log("> [INFO] \x1b[36mConnecting to mongodb database...\x1b[0m");
    console.log(config.host);
    mongoose.connect(config.host.toString());
    console.log("> [INFO] \x1b[42mConnected to mongodb database!\x1b[0m")
    return connected = true;
  }
  console.log("> [WARNING] Already connected to mongod database.")
  return connected = true;
};

*/
