'ue strict';

exports.StorageManager = class StorageManager {
  constructor() {
    this.storageController = require("./../../database/controllers/storageController");
  }

  /**
   * Get an item from the storage.
   * @param {String} skill 
   * @param {String} key 
   */
  getItem (skill, key) {
    return this.storageController.get_storage(skill, key);
  }

  /**
   * Store a new item in the storage.
   * @param {String} skill
   * @param {String} key
   * @param {Object} value
   */
  storeItem(skill, key, value) {
    return this.storageController.create_storage(skill, key, value)
  }

  /**
   * Clear the storage.
   */
  clear() {
    return this.storageController.clear_storage();
  }
}
