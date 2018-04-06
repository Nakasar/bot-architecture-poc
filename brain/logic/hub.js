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
  const fs = require('fs');
  const path = require('path');

  function getDirectories(srcpath) {
      return fs.readdirSync(srcpath).filter(function(file) {
          return fs.statSync(path.join(srcpath, file)).isDirectory();
      });
  }

  function listDependencies (packageFilePath) {
    let pack = require(packageFilePath);
    let dependencies = [];
    for (let mod in pack.dependencies) {
      dependencies.push(mod + "@" + pack.dependencies[mod]);
    }

    return dependencies;
  }

  function preloadSkills(skillsDirectory, skillsToLoad) {
    let dependencies = [];

    let npm = require('npm');
    // Build dependencies list
    for (let skill of skillsToLoad) {
      try {
        require(skillsDirectory + "/" + skill);
      } catch (e) {
        console.log(`> [WARNING] Could not load skill, add its dependencies.`);

        dependencies = dependencies.concat(listDependencies("./skills/" + skill + "/package.json"));
      }
    }


    if (dependencies.length > 0) {
      npm.load({loaded: false}, function (err) {
        console.log(`> [INFO] Installing missing dependencies: ${dependencies.join(", ")}`);
        let toInstall = dependencies;
        npm.commands.install(dependencies, (error, data) => {
          if (error) {
            console.log(`\x1b[31m> [ERROR] Could not load dependencies.\x1b[0m`);
            console.log(error.stack);
          }
          console.log(`\x1b[32m> [INFO] All missing dependencies installed.\x1b[0m`);
          loadSkills(skillsToLoad)
        })

        if (err) {
          console.log(`> [INFO] Plugins preloaded: ${err}`);
        }
      });
    } else {
      loadSkills(skillsToLoad)
    }
  }

  let skillsDirectory;
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

/**
  List plugged interactions from skills.
*/
let interactions = {
  interactions: {},
  get list() {
    let interactions = []
    for (let interaction in this.interactions) {
      interactions.push(interaction);
    }
    return interactions;
  },
  add: function(interactionName, interaction) {
    this.interactions[interactionName] = interaction;
  },
  get: function(interactionName) {
    return this.interactions[interactionName];
  },
  has: function(interactionName) {
    return this.list.includes(interactionName);
  },
  remove: function(interactionName) {
    if (this.has(interactionName)) {
      delete this.interactions[interactionName];
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
        if (skill.intents) {
          for (let intent in skill.intents) {
            console.log("\t\tRemoving " + intent);
            intents.remove(skill.intents[intent].slug);
          }
        }

        console.log(`\tRemoving linked Commands...`);
        if (skill.commands) {
          for (let command in skill.commands) {
            console.log("\t\tRemoving " + command);
            commands.remove(command);
          }
        }

        console.log(`\tRemoving linked Interactions...`);
        if (skill.interactions) {
          for (let interaction in skill.interactions) {
            console.log("\t\tRemoving " + interaction);
            interactions.remove(interaction);
          }
        }

        console.log(`\tRemoving skill...`);
        skills.remove(skillName);
        console.log(`> [INFO] Skill \x1b[33m${skillName}\x1b[0m successfully removed.`);

        console.log('> [INFO] Clearing cache for skill \x1b[33m${skillName}\x1b[0m');
        delete require.cache[require.resolve(`./skills/${skillName}/skill`)];

        console.log(`\tLoading skill \x1b[33m${skillName}\x1b[0m...`);
        skills.add(skillName, {});
        skills.get(skillName).active = false;
        skill = require(`./skills/${skillName}/skill`);
        skills.add(skillName, skill);

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

        for (let interactionName in skill.interactions) {
          let interaction = skill.interactions[interactionName];
          interaction.active = true;
          interactions.add(interaction.name, interaction);
        }

        skills.get(skillName).active = true;
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
  Load skill from /logic/skills folder.

  Store commands and intents into memory : skills, commands and intents.

  Params :
  --------
  skillName:
    String
*/
function loadSkill(skillName) {
  return new Promise((resolve, reject) => {
    console.log(`\tLoading skill \x1b[33m${skillName}\x1b[0m...`);
    delete require.cache[require.resolve(`./skills/${skillName}/skill`)];
    skills.add(skillName, {});
    skills.get(skillName).active = false;
    let skill = require(`./skills/${skillName}/skill`);
    skills.add(skillName, skill);

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

    for (let interactionName in skill.interactions) {
      let interaction = skill.interactions[interactionName];
      interaction.active = true;
      interactions.add(interaction.name, interaction);
    }

    skills.get(skillName).active = true;
    console.log(`\t..."${skillName}" successfully loaded`);

    return resolve();
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
    delete require.cache[require.resolve(`./skills/${skillName}/skill`)];
    try {
      skills.add(skillName, {});
      skills.get(skillName).active = false;
      let skill = require(`./skills/${skillName}/skill`);
      skills.add(skillName, skill);

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

      for (let interactionName in skill.interactions) {
        let interaction = skill.interactions[interactionName];
        interaction.active = true;
        interactions.add(interaction.name, interaction);
      }

      skills.get(skillName).active = true;
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
          return resolve({ success: false, message: { text: `I understand the intent is ${intentName}, but I'm missing some entities. I expect : ${intent.expected_entities.join(", ")}.` }});
        }
      }

      intent.handle(entities).then((response) => {
        return resolve({ success: true, message: response.message });
      });
    } else {
      console.log(`> [WARNING] Intent "\x1b[4m${intentName}\x1b[0m" is not handled.`);
      return resolve({ success: true, message: { text: `I can't handle your intention, yet I think it is *${intentName}*. Maybe it was disabled :/` }});
    }
  })
};

function handleCommand(commandName, phrase = "") {
  return new Promise((resolve, reject) => {
    console.log(`> [INFO] Handling command "\x1b[4m${commandName}\x1b[0m"`)

    if (commands.has(commandName) && commands.get(commandName).active) {
      let command = commands.get(commandName);
      console.log(command);
      command.execute(phrase).then((response) => {
        return resolve({ success: true, message: response.message, response: response });
      });
    } else {
      return resolve({ success: true, message: { text: `I can't handle your command because I don't know it. Maybe it was disabled :/ If not, you can teach me by adding new skills!` }});
    }
  })
};

function handlePhrase() {

};

function activateSkill(skillName) {
  return new Promise((resolve, reject) => {
    reloadSkill(skillName).then(() => {
      skills.get(skillName).active = true;
      let skill = skills.get(skillName);
      for (let intentName in skill.intents) {
        skill.intents[intentName].active = true;
      }
      for (let commandName in skill.commands) {
        skill.commands[commandName].active = true;
      }
      for (let interactionName in skill.interactions) {
        skill.interactions[interactionName].active = true;
      }
      return resolve();
    }).catch((err) => {
      return reject();
    });
  });
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
  for (let interactionName in skill.interactions) {
    skill.interactions[interactionName].active = false;
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
        return resolve();
      }).catch((err) => {
        console.log(err.stack);
        return reject();
      });
    });
  });
}

/**
  Add a new skill.

  Params :
  --------
  skill:
    {
      name: String -> Name of the skill. (required)
      code: String -> Code of the skill to add in skill.js. (required)
      secret: {key: value} -> Config to add in secret.js. (optional)
    }

    Returns :
    ---------
    Promise
*/
function addSkill(skill) {
  return new Promise((resolve, reject) => {

    // TODO: Check skill definition and skill code.


    console.log(`> [INFO] Adding code of skill \x1b[33m${skill.name}\x1b[0m...`);
    console.log(`\t... Create ${skill.name} folder...`)
    fs.mkdir(skillsDirectory + "/" + skill.name, function(err) {
      if (err) {
        console.log(err.stack);
        return reject({ title: "Could not create folder.", message: "Could not create skill folder on server." });
      }
      console.log(`\t... Create skill.js in ${skill.name} folder...`)
      fs.writeFile(skillsDirectory + "/" + skill.name + "/skill.js", skill.code, (err) => {
        if (err) {
          console.log(err.stack);
          return reject({ title: "Could not create skill.js file.", message: "Could not create skill.js file on server." });
        }

        if (skill.secret) {
          console.log(`\t... Create secret.js in ${skill.name} folder...`)
          fs.writeFile(skillsDirectory + "/" + skill.name + "/secret.js", "{}", (err) => {
            if (err) {
              console.log(err.stack);
              return reject({ title: "Could not create secret.js file.", message: "Could not create secret.js file on server." });
            }
            console.log(`> [INFO] Skill \x1b[33m${skill.name}\x1b[0m successfully added to folder.`);
            return resolve();
          });
        } else {
          console.log(`> [INFO] Skill \x1b[33m${skill.name}\x1b[0m successfully added to folder.`);
          return resolve();
        }
      });
    });
  });
};

/**
  Remove a skill.

  Params :
  --------
  skill:
    String Name of the skill to delete

    Returns :
    ---------
    Promise
*/
function deleteSkill(skillName) {
  return new Promise((resolve, reject) => {
    console.log(`> [INFO] Deleting skill \x1b[33m${skillName}\x1b[0m...`);

    console.log(`\tRemoving skill \x1b[33m${skillName}\x1b[0m...`);
    console.log(`\tRemoving associated Intents...`);
    let skill = skills.get(skillName);
    if (skill.intents) {
      for (let intent in skill.intents) {
        console.log("\t\tRemoving " + intent);
        intents.remove(skill.intents[intent].slug);
      }
    }

    console.log(`\tRemoving linked Commands...`);
    if (skill.commands) {
      for (let command in skill.commands) {
        console.log("\t\tRemoving " + command);
        commands.remove(command);
      }
    }

    console.log(`\tRemoving linked interactions...`);
    if (skill.interactions) {
      for (let interaction in skill.interactions) {
        console.log("\t\tRemoving " + interaction);
        interactions.remove(interaction);
      }
    }

    console.log(`\tRemoving skill...`);
    skills.remove(skillName);
    console.log(`> [INFO] Skill \x1b[33m${skillName}\x1b[0m successfully removed.`);

    console.log(`> [INFO] Clearing cache for skill \x1b[33m${skillName}\x1b[0m`);
    delete require.cache[require.resolve(`./skills/${skillName}/skill`)];

    console.log(`> [INFO] Removing files for skill \x1b[33m${skillName}\x1b[0m...`);
    try {
      deleteFolderRecursive(skillsDirectory + "/" + skillName);
      console.log(`> [INFO] Successfully removed folder ${skillsDirectory + "/" + skillName}`);
      return resolve();
    } catch(e) {
      return reject({ message: "Could not delete folder " + skillsDirectory + "/" + skillName });
    }
  });
}

function deleteFolderRecursive(path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function(file, index){
      var curPath = path + "/" + file;
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

function reloadBrain() {
  return new Promise((resolve, reject) => {
    try {
      loadSkillsFromFolder();
      return resolve();
    } catch(e) {
      return reject();
    }
  });
};

exports.handleIntent = handleIntent;
exports.handleCommand = handleCommand;
exports.handlePhrase = handlePhrase;

exports.activateSkill = activateSkill;
exports.deactivateSkill = deactivateSkill;
exports.loadSkill = loadSkill;
exports.reloadSkill = reloadSkill;
exports.getSkillCode = getSkillCode;
exports.saveSkillCode = saveSkillCode;
exports.addSkill = addSkill;
exports.deleteSkill = deleteSkill;
exports.reloadBrain = reloadBrain;

exports.skills = skills;
exports.commands = commands;
exports.intents = intents;


class ThreadManager {
  constructor() {
    this.threadController = require("./../database/controllers/threadController");
  }

  addThread({ timestamp: timestamp, handler: handler, source: source = "", data: data = [] }) {
    return this.threadController.create_thread({ timestamp: timestamp, handler: handler, source: source, data: data });
  }

  closeThread(threadId) {
    return this.threadController.delete_thread(threadId);
  }

  getThread(threadId) {
    return this.threadController.get_thread(threadId);
  }

  handleThread(threadId, phrase) {
    return new Promise((resolve, reject) => {
      this.threadController.get_thread(threadId).then((thread) => {
        console.log(`> [INFO] Handling interaction "\x1b[4m${thread.handler}\x1b[0m"`)

        if (interactions.has(thread.handler) && interactions.get(thread.handler).active) {
          return resolve(interactions.get(thread.handler).interact(thread, phrase));
        } else {
          return reject({ message: "Can not execute this interaction" });
        }
      }).catch((error) => {
        return reject(error);
      });
    });
  }
}

exports.ThreadManager = new ThreadManager();

loadSkillsFromFolder();
