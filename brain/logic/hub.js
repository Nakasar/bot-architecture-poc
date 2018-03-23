'use strict';

// TODO: Automated load of skills in folder /skills
let skillsToLoad = ['nlp', 'greetings', 'zze'];


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
  }
};


/**
  Load skills from /logic/skills folder.

  Store commands and intents into memory : skills, commands and intents.
*/
function loadSkills() {
  console.log(`> [INFO] Loading skills...`);
  for (let skillName of skillsToLoad) {
    console.log(`\tLoading skill "${skillName}"...`);
    try {
      let skill = require(`./skills/${skillName}/skill`);
      skills.add(skillName, skill);
      for (let intentName in skill.intents) {
        let intent = skill.intents[intentName];
        intents.add(intent.slug, skill);
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
}

exports.startSkill = function(skillName, phrase = undefined, analyzed = undefined) {
  return new Promise((resolve, reject) => {
    switch (skillName) {
      case "analyze":
        commands.get("analyze").execute(phrase).then((analyzed) => {
          return resolve({ success: true, analyzed: analyzed, message: 'Phrase analyzed.', source: phrase });
        }).catch((err) => {
          return reject({ success: false, message: `Unknown error with nlp skill.` });
        })
        break;
      case "say-thanks":
        commands.get("thanks").execute().then((response) => {
          return resolve({ success: true, message: response.message });
        })
        break;
      default:
        return resolve({ success: true, message: `I have no skill with this name: *${skillName}*. Maybe it was disabled :/` });
        break;
    }
  })
};

exports.skills = skills;
exports.commands = commands;
exports.intents = intents;

/**
  Load skills on module require (bot start).
*/
loadSkills();
console.log("               ");
console.log(`> [INFO] Loaded Skills: ${skills.list.join(", ")}`);
console.log(`> [INFO] Plugged Intents: ${intents.list.join(", ")}`);
console.log(`> [INFO] Available Commands: ${commands.list.join(", ")}`);
