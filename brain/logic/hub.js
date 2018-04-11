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
      let foundAllEntities = true;

      for (let entity of intent.expected_entities) {
        if (!Object.keys(entities).includes(entity)) {
          foundAllEntities = false;
          return resolve({ success: false, message: { text: `I understand the intent is ${intentName}, but I'm missing some entities. I expect : ${intent.expected_entities.join(", ")}.` }});
        }
      }

      intent.handle({ entities, data }).then((response) => {
        return resolve({ success: true, message: response.message });
      });
    } else {
      console.log(`> [WARNING] Intent "\x1b[4m${intentName}\x1b[0m" is not handled.`);
      return resolve({ success: true, message: { text: `I can't handle your intention, yet I think it is *${intentName}*. Maybe it was disabled :/` }});
    }
  })
};

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
      });
    } else {
      return resolve({ success: true, message: { text: `I can't handle your command because I don't know it. Maybe it was disabled :/ If not, you can teach me by adding new skills!` }});
    }
  })
};

function reloadBrain() {
  return new Promise((resolve, reject) => {
    try {
      SkillManager.loadSkillsFromFolder();
      return resolve();
    } catch(e) {
      return reject(e);
    }
  });
};

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

// Export main handlers
exports.handleIntent = handleIntent;
exports.handleCommand = handleCommand;

// Exoport skill commands
exports.activateSkill = SkillManager.activateSkill;
exports.deactivateSkill = SkillManager.deactivateSkill;
exports.loadSkill = SkillManager.loadSkill;
exports.reloadSkill = SkillManager.reloadSkill;
exports.getSkillCode = SkillManager.getSkillCode;
exports.saveSkillCode = SkillManager.saveSkillCode;
exports.addSkill = SkillManager.addSkill;
exports.deleteSkill = SkillManager.deleteSkill;
exports.reloadBrain = reloadBrain;

// Export components (TODO: DO **NOT** EXPORT THESE INTERNAL LISTS)
exports.skills = SkillManager.skills;
exports.commands = SkillManager.commands;
exports.intents = SkillManager.intents;

SkillManager.loadSkillsFromFolder();
