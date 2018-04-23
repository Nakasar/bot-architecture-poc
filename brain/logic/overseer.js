'use strict';

let hub = require('./hub');

module.exports.handleCommand = hub.handleCommand;
module.exports.ThreadManager = hub.ThreadManager;
module.exports.StorageManager = {
  getItem: (skill, key) => hub.StorageManager.getItem(skill, key),
  storeItem: (skill, key, value) => hub.StorageManager.storeItem(skill, key, value)
};;
module.exports.HookManager = {
  create: (skill) => hub.HookManager.create(skill),
  execute: (hookId, message) => hub.HookManager.execute(hookId, message)
}
