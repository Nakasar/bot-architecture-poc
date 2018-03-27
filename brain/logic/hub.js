'use strict';

const skillsDirectory = "./logic/skills";

const fs = require('fs');
const path = require('path');
function getDirectories(srcpath) {
    return fs.readdirSync(srcpath).filter(function(file) {
        return fs.statSync(path.join(srcpath, file)).isDirectory();
    });
}

/**
  Load skills from skills folder (on bot start).
*/
function loadSkillsFromFolder() {
  let skillsFolders;
  try {
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
  },
  remove: function(skillName) {
    if (this.has(skillName)) {
      delete this.skills[skillName];
    }
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
  },
  remove: function(commandWord) {
    if (this.has(commandWord)) {
      delete this.commands[commandWord];
    }
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
  },
  remove: function(intentName) {
    if (this.has(intentName)) {
      delete this.intents[intentName];
    }
  }
};

function reloadSkill(skillName) {
  return new Promise((resolve, reject) => {
    if (skills.has(skillName)) {
      try {
        console.log(`> [INFO] Reloading skill \x1b[33m${skillName}\x1b[0m...`);

        console.log(`\tRemoving skill \x1b[33m${skillName}\x1b[0m...`);
        console.log(`\tRemoving associated Intents...`);
        let skill = skills.get(skillName);
        for (let intent in skill.intents) {
          console.log("\t\tRemoving " + intent);
          intents.remove(skill.intents[intent].slug);
        }
        console.log(`\tRemoving linked Commands...`);
        for (let command in skill.commands) {
          console.log("\t\tRemoving " + command);
          commands.remove(command);
        }
        console.log(`\tRemoving skill...`);
        skills.remove(skillName);
        console.log(`> [INFO] Skill \x1b[33m${skillName}\x1b[0m successfully removed.`);

        console.log('> [INFO] Clearing cache for skill \x1b[33m${skillName}\x1b[0m');
        delete require.cache[require.resolve(`./skills/${skillName}/skill`)];

        console.log(`\tLoading skill \x1b[33m${skillName}\x1b[0m...`);
        skill = require(`./skills/${skillName}/skill`);
        skills.add(skillName, skill);
        skills.get(skillName).active = true;
        for (let intentName in skill.intents) {
          let intent = skill.intents[intentName];
          intent.active = true;
          intents.add(intent.slug, intent);
        }
        for (let commandName in skill.commands) {
          let command = skill.commands[commandName];
          command.active = true;
          commands.add(command.cmd, command);
        }
        console.log(`\t..."${skillName}" successfully loaded`);

        console.log(`> [INFO] Skill \x1b[33m${skillName}\x1b[0m successfully reloaded.`);
        return resolve();
      } catch(e) {
        console.log(e.stack);
        return reject();
      }
    } else {
      reject();
    }
  });
}

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
      skills.get(skillName).active = true;
      for (let intentName in skill.intents) {
        let intent = skill.intents[intentName];
        intent.active = true;
        intents.add(intent.slug, intent);
      }
      for (let commandName in skill.commands) {
        let command = skill.commands[commandName];
        command.active = true;
        commands.add(command.cmd, command);
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

function handleIntent(intentName, entities = {}) {
  return new Promise((resolve, reject) => {
    console.log(`> [INFO] Handling intent "\x1b[4m${intentName}\x1b[0m"`);
    if (intents.has(intentName) && intents.get(intentName).active) {
      let intent = intents.get(intentName);
      let foundAllEntities = true;

      for (let entity of intent.expected_entities) {
        if (!Object.keys(entities).includes(entity)) {
          foundAllEntities = false;
          return resolve({ success: false, message: `I understand the intent is ${intentName}, but I'm missing some entities. I expect : ${intent.expected_entities.join(", ")}.` });
        }
      }

      intent.handle(entities).then((response) => {
        return resolve({ success: true, message: response.message });
      });
    } else {
      console.log(`> [WARNING] Intent "\x1b[4m${intentName}\x1b[0m" is not handled.`);
      return resolve({ success: true, message: `I can't handle your intention, yet I think it is *${intentName}*. Maybe it was disabled :/` });
    }
  })
};

function handleCommand(commandName, phrase = "") {
  return new Promise((resolve, reject) => {
    console.log(`> [INFO] Handling command "\x1b[4m${commandName}\x1b[0m"`)

    if (commands.has(commandName) && commands.get(commandName).active) {
      let command = commands.get(commandName);

      command.execute(phrase).then((response) => {
        return resolve({ success: true, message: response.message, response: response });
      });
    } else {
      return resolve({ success: true, message: `I can't handle your command because I don't know it. Maybe it was disabled :/ If not, you can teach me by adding new skills!` });
    }
  })
};

function handlePhrase() {

};

function activateSkill(skillName) {
  skills.get(skillName).active = true;
  let skill = skills.get(skillName);
  for (let intentName in skill.intents) {
    skill.intents[intentName].active = true;
  }
  for (let commandName in skill.commands) {
    skill.commands[commandName].active = true;
  }
};

function deactivateSkill(skillName) {
  skills.get(skillName).active = false;
  let skill = skills.get(skillName);
  for (let intentName in skill.intents) {
    skill.intents[intentName].active = false;
  }
  for (let commandName in skill.commands) {
    skill.commands[commandName].active = false;
  }
}

function getSkillCode(skillName) {
  return new Promise((resolve, reject) => {
    if (skills.has(skillName)) {
      fs.readFile(skillsDirectory + "/" + skillName + "/skill.js", 'utf8', (err, data) => {
        if (err) {
          console.log(err.stack);
          return reject();
        }
        let code = data;
        return resolve(code);
      })
    } else {
      return reject();
    }
  });
}

function saveSkillCode(skillName, code) {
  return new Promise((resolve, reject) => {
    console.log(`> [INFO] Saving code of skill \x1b[33m${skillName}\x1b[0m...`);
    fs.writeFile(skillsDirectory + "/" + skillName + "/skill.js", code, 'utf8', (err) => {
      if (err) {
        console.log(err.stack);
        return reject();
      }
      console.log(`\t... Reload skill.`);
      reloadSkill(skillName).then(() => {
        console.log("resolved");
        return resolve();
      }).catch((err) => {
        console.log(err.stack);
        return reject();
      });
    });
  });
}

exports.handleIntent = handleIntent;
exports.handleCommand = handleCommand;
exports.handlePhrase = handlePhrase;

exports.activateSkill = activateSkill;
exports.deactivateSkill = deactivateSkill;
exports.reloadSkill = reloadSkill;
exports.getSkillCode = getSkillCode;
exports.saveSkillCode = saveSkillCode;

exports.skills = skills;
exports.commands = commands;
exports.intents = intents;


loadSkillsFromFolder();
