'use strict';

class HookManager {
  constructor() {
    this.hookController = require("./../../database/controllers/hookController");
    this.io = null;
  }

  /**
   * Attach the brain socket io server to the HookManager.
   * @param {socket.io server} io 
   */
  attachIo(io) {
    this.io = io;
  }

  /**
   * Create a new hook for a skill.
   * @param {String} skill 
   * @return {Promise} Promise to the created hook : { _id, skill }
   */
  create(skill) {
   return this.hookController.create_hook(skill);
  }

  /**
   * Confirm a hook.
   * @param {String} hookId 
   * @param {String} connectorId
   * @return {Promise} Promise that resolves if the hook is validated, false otherwise.
   */
  finalize(hookId, connectorId) {
   return this.hookController.add_connector(hookId, connectorId);
  }

  /**
   * Execute a hook to contact the connector.
   * @param {String} hookId 
   * @param {Object} message - Valid message object to send to the connector.
   * @return {Promise} Promise that resolves if the message was sent, false otherwise.
   */
  execute(hookId, message) {
    return new Promise((resolve, reject) => {
      this.get(hookId).then((hook) => {
        if (this.io && this.io.sockets) {
          const socket = Object.values(this.io.sockets.sockets).filter((socket) => {
            return socket.connector.id == hook.connector
          });
          if (socket.length > 0) {
            socket[0].emit('hook', hook._id, {
              message
            });
            return resolve();
          } else {
            return reject(new Error(`No connector linked to this hook currently online.`));
          }
        } else {
          return reject(new Error('No sockets instancied, hook can not be executed.'));
        }
      }).catch((err) => {
        return reject(err);
      });
    });
  }

  /**
   * Remove a hook.
   * @param {String} hookId
   * @return {Promise} Promise that resolves if success, false otherwise.
   */
  remove(hookId) {
   return this.hookController.delete_hook(hookId);
  }

  /**
   * Get a hook.
   * @param {String} hookId
   * @return {Promise} Promise to the hook : { _id, skill, connector }
   */
  get(hookId) {
   return this.hookController.get_hook(hookId);
  }

  getForConnector(connectorId) {
   return null;
  }
}

module.exports.HookManager = HookManager;
