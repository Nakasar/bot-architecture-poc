'ue strict';

exports.StorageManager = class StorageManager {
  constructor() {
    this.storageController = require("./../../database/controllers/storageController");
  }

  getItem (skill, key) {
    return this.storageController.get_storage(skill, key);
  }

  storeItem(skill, key, value) {
    return this.storageController.create_storage(skill, key, value)
  }

  clear() {
    return this.storageController.clear_storage();
  }
}
