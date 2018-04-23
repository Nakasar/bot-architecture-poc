class HookManager {
  constructor(robot) {
    this.hooks = new Map();
  }

  createHook(hookId, room) {
    console.log(`> [INFO] Create hook ${hookId} for room ${room}`);
    this.hooks.set(hookId, room);
  }

  removeHook(hookId) {
    this.hooks.delete(hookId);
  }

  handleHook(hookId, message) {
    return new Promise((resolve, reject) => {
      console.log(`> [INFO] Handling hook ${hookId} bearing message:`);
      console.log(message);
      if (!this.hooks.has(hookId)) {
        return reject(new Error ('No hook with id ' + hookId));
      }
      let room = this.hooks.get(hookId);
      return resolve({ room, message });
    });
  }
}

module.exports.HookManager = HookManager;
