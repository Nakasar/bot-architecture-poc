'use strict';
var Hook = require("../models/hookModel");

/**
 * Create a new hook.
 *
 * @param {Hook} hook - A Hook representation with at last the skill name.
 * @returns {Promise<Hook>} A promise to the created Hook.
 */
module.exports.create_hook = function(skill) {
  return new Promise((resolve, reject) => {
    if (!skill) {
        return reject(new Error("Can't create a hook without skill name."));
    }

    let new_hook = new Hook();
    new_hook.skill = skill;
    new_hook.save((err) => {
      if (err) {
        return reject(err);
      }
      return resolve(new_hook);
    });
  });
};

module.exports.add_connector = function (hookId, connectorId) {
  return new Promise((resolve, reject) => {
    Hook.findById(hookId).then((hook) => {
      if (!hook) {
        return reject({
          code: 404,
          message: "No hook with id " + hookId
        });
      }
      if (hook.connector && hooks.connector.length > 0) {
        return reject({
          code: 500,
          message: `Hook ${hookId} is already linked to a connector.`
        });
      }
      hook.connector = connectorId;
      hook.save((err) => {
        if (err) {
          console.log(err);
          return reject({
            code: 500,
            message: "Could not link hook to connector."
          });
        }
        return resolve();
      });
    }).catch((err) => {
      console.log(err);
      return reject({
        code: 500,
        message: "Could not link hook to connector."
      });
    });
  });
}

module.exports.get_hook = function(hookId) {
  return new Promise((resolve, reject) => {
    Hook.findById(hookId, (err, hook) => {
      if (err) {
        console.log(err);
        return reject({
          code: 500,
          message: "Could not get hook."
        });
      }
      if (!hook) {
        return reject(new Error(`No hook with id ${hookId}.`));
      }
      return resolve(hook);
    });
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

module.exports.purge_hooks = function() {
  return new Promise((resolve, reject) => {
    Hook.remove({ connector: { $exists: false }}, (err) => {
      if (err) {
        console.log(err);
        return reject(err);
      }
      return resolve();
    })
  });
}
