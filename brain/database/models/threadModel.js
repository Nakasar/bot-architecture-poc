'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ThreadSchema = new Schema({
  timestamp: {
    type: Date,
    default: new Date()
  },
  source: {
    type: String,
    required: true
  },
  data: {
    type: Array,
    default: []
  },
  handler: {
    type: String,
    required: true
  }
});

ThreadSchema.methods.getData = function(dataKey) {
  for (let data of this.data) {
    if (data[0] === dataKey) {
      return data[1];
    }
    return null;
  }
};

const Thread = mongoose.model('Thread', ThreadSchema);

module.exports = Thread;
