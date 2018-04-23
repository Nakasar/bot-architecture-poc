'use strict';

class HookManager {
  constructor() {
    this.hookController = require("./../../database/controllers/hookController");
    this.io = null;
  }

  attachIo(io) {
    this.io = io;
  }

  create() {
   return this.hookController.create_hook();
  }

  finalize(hookId, connectorId) {
   return this.hookController.add_connector(hookId, connectorId);
  }

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
            return reject(new Error(`No hook with id ${hookId}`));
          }
        } else {
          return reject(new Error('No sockets instancied, hook can not be executed.'));
        }
      }).catch((err) => {
        return reject(err);
      });
    });
  }

  remove(hookId) {
   return this.hookController.delete_hook(hookId);
  }

  get(hookId) {
   return this.hookController.get_hook(hookId);
  }

  getForConnector(connectorId) {
   return null;
  }
}

module.exports.HookManager = HookManager;
