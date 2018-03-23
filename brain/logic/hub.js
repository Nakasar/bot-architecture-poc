'use strict';

/**
  Load skills from skills folder (on bot start).
*/
function loadSkillsFromFolder() {
  const fs = require('fs');
  const path = require('path');

  function getDirectories(srcpath) {
      return fs.readdirSync(srcpath).filter(function(file) {
          return fs.statSync(path.join(srcpath, file)).isDirectory();
      });
  }

  let skillsDirectory;
  let skillsFolders;
  try {
    skillsDirectory = "./logic/skills";
    console.log(`> [INFO] Loading skills directory: "\x1b[4m${skillsDirectory}\x1b[0m"...`);
    skillsFolders = getDirectories(skillsDirectory)
    console.log(`> [INFO] Skills folders found: \x1b[33m${skillsFolders.join(", ")}\x1b[0m.`);
  } catch(e) {
    console.log(e.stack);
  }

  /**
    Load skills on module require (bot start).
  */
  // TODO: Automated load of skills in folder /skills
  let skillsToLoad = skillsFolders;

  loadSkills(skillsToLoad);
}

/**
  List running skills.
*/
let skills = {
  skills: {},
  get list() {
    let skills = []
    for (let skill in this.skills) {
      skills.push(skill);
    }
    return skills;
  },
  add: function(skillName, skill) {
    this.skills[skillName] = skill;
  },
  get: function(skillName) {
    return this.skills[skillName];
  },
  has: function(skillName) {
    return this.list.includes(skillName);
  }
};

/**
  List available commands linked to skills.
*/
let commands = {
  commands: {},
  get list() {
    let commands = []
    for (let command in this.commands) {
      commands.push(command);
    }
    return commands;
  },
  add: function(commandWord, command) {
    this.commands[commandWord] = command;
  },
  get: function(commandWord) {
    return this.commands[commandWord];
  },
  has: function(commandWord) {
    return this.list.includes(commandWord);
  }
};

/**
  List plugged intents from skills.
*/
let intents = {
  intents: {},
  get list() {
    let intents = []
    for (let intent in this.intents) {
      intents.push(intent);
    }
    return intents;
  },
  add: function(intentName, linkedSkill) {
    this.intents[intentName] = linkedSkill;
  },
  get: function(intentName) {
    return this.intents[intentName];
  },
  has: function(intentName) {
    return this.list.includes(intentName);
  }
};


/**
  Load skills from /logic/skills folder.

  Store commands and intents into memory : skills, commands and intents.
*/
function loadSkills(skillsToLoad) {
  console.log(`> [INFO] Loading skills...`);
  for (let skillName of skillsToLoad) {
    console.log(`\tLoading skill "${skillName}"...`);
    try {
      let skill = require(`./skills/${skillName}/skill`);
      skills.add(skillName, skill);
      for (let intentName in skill.intents) {
        let intent = skill.intents[intentName];
        intents.add(intent.slug, intent);
      }
      for (let commandName in skill.commands) {
        let command = skill.commands[commandName];
        commands.add(command.cmd, command)
      }
      console.log(`\t..."${skillName}" successfully loaded`);
    } catch(e) {
      console.error(`\x1b[31m[ERROR]\t..."${skillName}" could not load!\x1b[0m`);
      console.log(e);
    }
  }

  console.log("               ");
  console.log(`> [INFO] Loaded Skills: ${skills.list.join(", ")}`);
  console.log(`> [INFO] Plugged Intents: ${intents.list.join(", ")}`);
  console.log(`> [INFO] Available Commands: ${commands.list.join(", ")}`);
};

function handleIntent(intentName) {
  return new Promise((resolve, reject) => {
    console.log(`> [INFO] Handling intent "\x1b[4m${intentName}\x1b[0m"`);
    if (intents.has(intentName)) {
      intents.get(intentName).handle().then((response) => {
        return resolve({ success: true, message: response.message });
      });
    } else {
      console.log(`> [WARNING] Intent "\x1b[4m${intentName}\x1b[0m" is not handled.`);
      return resolve({ success: true, message: `I can't handle your intention, yet I think it is *${intentName}*. Maybe it was disabled :/` });
    }
  })
};

function handleCommand(commandName, params = {}) {
  return new Promise((resolve, reject) => {
    console.log(`> [INFO] Handling command "\x1b[4m${commandName}\x1b[0m"`)
    if (commands.has(commandName)) {
      let command = commands.get(commandName);
      let allParametersFound = true;

      for (var expectedParam of command.expected_args) {
        if (!Object.keys(params).includes(expectedParam)) {
          allParametersFound = false;
        }
      }

      if (!allParametersFound) {
        return resolve({ success: true, message: `I can't execute ${commandName} because you didn't specified enough parameters. I am awaiting : \`${command.expected_args}\`.` });
      }

      command.execute(params).then((response) => {
        return resolve({ success: true, message: response.message, response: response });
      });
    } else {
      return resolve({ success: true, message: `I can't handle your because I don't know it. Maybe it was disabled :/ If not, you can teach me by adding new skills!` });
    }
  })
};

function handlePhrase() {

};

exports.handleIntent = handleIntent;
exports.handleCommand = handleCommand;
exports.handlePhrase = handlePhrase;

exports.skills = skills;
exports.commands = commands;
exports.intents = intents;


loadSkillsFromFolder();
