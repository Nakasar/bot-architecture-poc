'use strict';
const path = require('path');

/**
 * Handle an intent. Find the related skill and call it.
 * @param
 {String} intentName The name of the intent (slug given by nlp service provider).
 * @param {Object} [entities={}] - Entities returned by the nlp service provider (if any).
 * @param {Object} [data={}] - Data sent by the connector to the brain.
 * @return {Promise} Promise object represents the answer of the skill (message to send back to connector, optional data...)
 */
function handleIntent(intentName, entities = {}, data = {}) {
  return new Promise((resolve, reject) => {
    console.log(`> [INFO] Handling intent "\x1b[4m${intentName}\x1b[0m"`);
    if (SkillManager.intents.has(intentName) && SkillManager.intents.get(intentName).active) {
      let intent = SkillManager.intents.get(intentName);

      for (let entity of intent.expected_entities) {
        if (!Object.keys(entities).includes(entity)) {
          return resolve({ success: false, message: { text: `I understand the intent is ${intentName}, but I'm missing some entities. I expect : ${intent.expected_entities.join(", ")}.` }});
        }
      }

      intent.handle({ entities, data }).then((response) => {
        return resolve({ success: true, message: response.message });
      }).catch((err) => {
        return reject(err);
      });
    } else {
      console.log(`> [WARNING] Intent "\x1b[4m${intentName}\x1b[0m" is not handled.`);
      return resolve({ success: true, message: { text: `I can't handle your intention, yet I think it is *${intentName}*. Maybe it was disabled :/` }});
    }
  })
}

/**
 * Handle a command. Find the related skill and call it.
 * @param {String} commandName The word of the command to execute.
 * @param {String} [phrase=""] - Parameters of the command (string following command word) sent by connector.
 * @param {Object} [data={}] - Data sent by the connector to the brain.
 * @return {Promise} Promise object represents the answer of the skill (message to send back to connector, optional data...)
 */
function handleCommand(commandName, phrase = "", data = {}) {
  return new Promise((resolve, reject) => {
    console.log(`> [INFO] Handling command "\x1b[4m${commandName}\x1b[0m"`)

    if (SkillManager.commands.has(commandName) && SkillManager.commands.get(commandName).active) {
      let command = SkillManager.commands.get(commandName);

      command.execute({ phrase, data }).then((response) => {
        return resolve({ success: true, message: response.message, response: response });
      }).catch((err) => {
        return reject(err);
      });
    } else {
      return resolve({ success: true, message: { text: `I can't handle your command because I don't know it. Maybe it was disabled :/ If not, you can teach me by adding new skills!` }});
    }
  })
}

/**
 * Fully reload all the skills.
 * @return {Promise} promise object that resolves if success.
 */
function reloadBrain() {
  return new Promise((resolve, reject) => {
    try {
      SkillManager.loadSkillsFromFolder();
      return resolve();
    } catch(e) {
      return reject(e);
    }
  });
}

// Create a new SkillManager
const skillComponent = require('./components/SkillManager');
const SkillManager = new skillComponent.SkillManager(path.join(__dirname, "./skills"));

// Create and export a new ConnectorManager.
const connectorComponent = require('./components/ConnectorManager');
let ConnectorManager = new connectorComponent.ConnectorManager();
exports.ConnectorManager = ConnectorManager;

// Create and export a new ThreadManager
const threadComponent = require('./components/ThreadManager');
let ThreadManager = new threadComponent.ThreadManager(SkillManager.interactions);
exports.ThreadManager = ThreadManager;

// Create and export a new StorageManager
const storageComponent = require('./components/StorageManager');
let StorageManager = new storageComponent.StorageManager();
exports.StorageManager = StorageManager;

// Create and export a new HookManaher
const hookComponent = require('./components/HookManager');
let HookManager = new hookComponent.HookManager();
exports.HookManager = HookManager;


// Export main handlers
exports.handleIntent = handleIntent;
exports.handleCommand = handleCommand;

// Exoport skill commands
exports.activateSkill = (skillName) => SkillManager.activateSkill(skillName);
exports.deactivateSkill = (skillName) => SkillManager.deactivateSkill(skillName);
exports.loadSkill = (skillName) => SkillManager.loadSkill(skillName);
exports.reloadSkill = (skillName) => SkillManager.reloadSkill(skillName);
exports.getSkillCode = (skillName) => SkillManager.getSkillCode(skillName);
exports.saveSkillCode = (skillName, code) => SkillManager.saveSkillCode(skillName, code);
exports.addSkill = (skill) => SkillManager.addSkill(skill);
exports.deleteSkill = (skillName) => SkillManager.deleteSkill(skillName);
exports.getSkills = () => SkillManager.getSkills();
exports.getSkillSecret = (skillName) => SkillManager.getSkillSecret(skillName);
exports.updateSkillSecret = (skillName, secret) => SkillManager.updateSkillSecret(skillName, secret);
exports.getSkill = (skillName) => SkillManager.getSkill(skillName);
exports.hasSkill = (skillName) => SkillManager.hasSkill(skillName);

exports.reloadBrain = reloadBrain;

SkillManager.loadSkillsFromFolder();
