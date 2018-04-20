'use strict';

let hub = require('./hub');

module.exports.handleCommand = hub.handleCommand;
module.exports.ThreadManager = hub.ThreadManager;
module.exports.StorageManager = {
  getItem: (skill, key) => hub.StorageManager.getItem(skill, key),
  storeItem: (skill, key, value) => hub.StorageManager.storeItem(skill, key, value)
};;
