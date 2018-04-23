'use strict';
var Hook = require("../models/hookModel");

/**
 * Create a new hook.
 *
 * @param {Hook} hook - A Hook representation with at last the skill name.
 * @returns {Promise<Hook>} A promise to the created Hook.
 */
module.exports.create_hook = function(hook) {
  return new Promise((resolve, reject) => {

    let new_hook = new Hook();

    hooks[new_hook._id] = new_hook;

    return resolve(new_hook);
  });
};

module.exports.add_connector = function (hookId, connectorId) {
  return new Promise((resolve, reject) => {
    if (!hooks[hookId]) {
      return reject({
        code: 404,
        message: "No hook with id " + hookId
      });
    }
    if (hooks[hookId].connector && hooks[hookId].connector.length > 0) {
      return reject({
        code: 500,
        message: `Hook ${hookId} is already linked to a connector.`
      });
    }
    hooks[hookId].connector = connectorId;
    return resolve();
  });
}

module.exports.get_hook = function(hookId) {
  return new Promise((resolve, reject) => {
    if (hooks[hookId]) {
      return resolve(hooks[hookId]);
    }
    return reject(new Error(`No hook with id ${hookId}.`));
  });
}

module.exports.delete_hook = function(hookId) {
  return new Promise((resolve, reject) => {
    if (hooks[hookId]) {
      delete hooks[hookId];
      return resolve();
    }
    return resolve();
  })
}

let hooks = {};
