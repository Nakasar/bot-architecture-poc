'use strict';
var Storage = require("../models/storageModel");

module.exports.create_storage = function(skill, key, value) {
  return new Promise((resolve, reject) => {
    try {
      const stringifiedValue = JSON.stringify(value);

      Storage.findOne({ skill, key }, (err, found) => {
        if (err) {
          return reject(err);
        } else if (found) {
          // Override storage.
          found.value = stringifiedValue;
          found.save((err) => {
            if (err) {
              return reject(err);
            }
            return resolve(found);
          });
        } else {
          // Create enw storage
          let storage = new Storage();
          storage.skill = skill;
          storage.key = key;
          storage.value = stringifiedValue;
          storage.save((err) => {
            if (err) {
              return reject(err);
            }
            return resolve(storage);
          });
        }
      });
    } catch (e) {
      return reject(e);
    }
  });
}

module.exports.get_storage = function(skill, key) {
  return new Promise((resolve, reject) => {
    Storage.findOne({ skill, key }, (err, storage) => {
      if (err) {
        return reject(err);
      } else if (storage) {
        try {
          const jsonValue = JSON.parse(storage.value);
          return resolve(jsonValue);
        } catch (e) {
          return reject(e);
        }
      } else {
        return resolve(null);
      }
    });
  });
}

module.exports.clear_storage = function() {
  return new Promise((resolve, reject) => {
    Storage.remove({}, (err) => {
      if (err) {
        return reject(err);
      }
      return resolve();
    });
  });
}
