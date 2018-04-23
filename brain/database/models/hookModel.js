'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const HookSchema = new Schema({
  connector: {
    type: String
  },
  skill: {
    type: String
  }
});

const Hook = mongoose.model('Hook', HookSchema);

module.exports = Hook;
