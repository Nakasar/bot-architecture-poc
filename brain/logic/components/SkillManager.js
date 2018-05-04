'use strict';

const fs = require('fs');
const path = require('path');

const skillTemplateRegex = fs.readFileSync(path.join(__dirname, "./skillCodeRegex.txt"), "utf8").trim();

exports.SkillManager = class SkillManager {
  constructor(skillsDirectory) {
    this.skillsDirectory = skillsDirectory;

    this.skills = {
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
      },
      *[Symbol.iterator]() {
        yield *Object.entries(this.skills);
      }
    };

    this.commands = {
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
      },
      *[Symbol.iterator]() {
        yield *Object.entries(this.commands);
      }
    };

    this.intents = {
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
      },
      *[Symbol.iterator]() {
        yield *Object.entries(this.intents);
      }
    };

    this.interactions = {
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
      },
      *[Symbol.iterator]() {
        yield *Object.entries(this.interactions);
      }
    };
  }

  /**
   *  Reload a specific skill. (Remove it, reload it, add it).
   * @param {String} skillName The name of the skill to reload.
   * @return {Promise} Promise object resolve if success, reject otherwise.
   */
  reloadSkill(skillName) {
    return new Promise((resolve, reject) => {
      if (this.skills.has(skillName)) {
        try {
          console.log(`> [INFO] Reloading skill \x1b[33m${skillName}\x1b[0m...`);

          console.log(`\tRemoving skill \x1b[33m${skillName}\x1b[0m...`);
          console.log(`\tRemoving associated Intents...`);
          let skill = this.skills.get(skillName);
          if (skill.intents) {
            for (let intent in skill.intents) {
              console.log("\t\tRemoving " + intent);
              this.intents.remove(skill.intents[intent].slug);
            }
          }

          console.log(`\tRemoving linked Commands...`);
          if (skill.commands) {
            for (let command in skill.commands) {
              console.log("\t\tRemoving " + command);
              this.commands.remove(command);
            }
          }

          console.log(`\tRemoving linked Interactions...`);
          if (skill.interactions) {
            for (let interaction in skill.interactions) {
              console.log("\t\tRemoving " + interaction);
              this.interactions.remove(interaction);
            }
          }

          console.log(`\tRemoving skill...`);
          this.skills.remove(skillName);
          console.log(`> [INFO] Skill \x1b[33m${skillName}\x1b[0m successfully removed.`);

          console.log('> [INFO] Clearing cache for skill \x1b[33m${skillName}\x1b[0m');
          delete require.cache[require.resolve(path.join(this.skillsDirectory, `/${skillName}/skill`))];
          if (fs.existsSync(path.join(this.skillsDirectory, `/${skillName}/secret`))) {
            delete require.cache[require.resolve(path.join(this.skillsDirectory, `/${skillName}/secret`))];
          }

          console.log(`\tLoading skill \x1b[33m${skillName}\x1b[0m...`);
          this.skills.add(skillName, {});
          this.skills.get(skillName).active = false;
          skill = require(path.join(this.skillsDirectory, `/${skillName}/skill`));
          this.skills.add(skillName, skill);

          for (let intentName in skill.intents) {
            let intent = skill.intents[intentName];
            intent.active = true;
            this.intents.add(intent.slug, intent);
          }

          for (let commandName in skill.commands) {
            let command = skill.commands[commandName];
            command.active = true;
            this.commands.add(command.cmd, command);
          }

          for (let interactionName in skill.interactions) {
            let interaction = skill.interactions[interactionName];
            interaction.active = true;
            this.interactions.add(interaction.name, interaction);
          }

          this.skills.get(skillName).active = true;
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
   * Load skill from /logic/skills folder.
   * @param {String} skillName The name of the skill to load.
   * @return {Promise} Promise object resolve if success, reject otherwise.
   */
  loadSkill(skillName) {
    return new Promise((resolve, reject) => {
      console.log(`\tLoading skill \x1b[33m${skillName}\x1b[0m...`);
      delete require.cache[require.resolve(path.join(this.skillsDirectory, `/${skillName}/skill`))];
      if (fs.existsSync(path.join(this.skillsDirectory, `/${skillName}/secret`))) {
        delete require.cache[require.resolve(path.join(this.skillsDirectory, `/${skillName}/secret`))];
      }
      this.skills.add(skillName, {});
      this.skills.get(skillName).active = false;
      let skill = require(path.join(this.skillsDirectory, `/${skillName}/skill`));
      this.skills.add(skillName, skill);

      for (let intentName in skill.intents) {
        let intent = skill.intents[intentName];
        intent.active = true;
        this.intents.add(intent.slug, intent);
      }

      for (let commandName in skill.commands) {
        let command = skill.commands[commandName];
        command.active = true;
        this.commands.add(command.cmd, command);
      }

      for (let interactionName in skill.interactions) {
        let interaction = skill.interactions[interactionName];
        interaction.active = true;
        this.interactions.add(interaction.name, interaction);
      }

      this.skills.get(skillName).active = true;
      console.log(`\t..."${skillName}" successfully loaded`);

      return resolve();
    });
  }

  /**
   * Load skills from /logic/skills folder.
   * Store commands and intents into memory : skills, commands and intents.
   * @param {String[]} skillsToLoad The names of skills to load.
   */
  loadSkills(skillsToLoad) {
    console.log(`> [INFO] Loading skills...`);
    for (let skillName of skillsToLoad) {
      console.log(`\tLoading skill "${skillName}"...`);
      delete require.cache[require.resolve(path.join(this.skillsDirectory, `/${skillName}/skill`))];
      if (fs.existsSync(path.join(this.skillsDirectory, `/${skillName}/secret`))) {
        delete require.cache[require.resolve(path.join(this.skillsDirectory, `/${skillName}/secret`))];
      }
      try {
        this.skills.add(skillName, {});
        this.skills.get(skillName).active = false;
        let skill = require(path.join(this.skillsDirectory, `/${skillName}/skill`));
        this.skills.add(skillName, skill);

        for (let intentName in skill.intents) {
          let intent = skill.intents[intentName];
          intent.active = true;
          this.intents.add(intent.slug, intent);
        }

        for (let commandName in skill.commands) {
          let command = skill.commands[commandName];
          command.active = true;
          this.commands.add(command.cmd, command);
        }

        for (let interactionName in skill.interactions) {
          let interaction = skill.interactions[interactionName];
          interaction.active = true;
          this.interactions.add(interaction.name, interaction);
        }

        this.skills.get(skillName).active = true;
        console.log(`\t..."${skillName}" successfully loaded`);
      } catch(e) {
        console.error(`\x1b[31m[ERROR]\t..."${skillName}" could not load!\x1b[0m`);
        console.log(e);
      }
    }

    console.log("               ");
    console.log(`> [INFO] Loaded Skills: ${this.skills.list.join(", ")}`);
    console.log(`> [INFO] Plugged Intents: ${this.intents.list.join(", ")}`);
    console.log(`> [INFO] Available Commands: ${this.commands.list.join(", ")}`);
  }

  /**
   *  Get list of directories at a given path.
   * @param {String} srcPath - path where to get list of directories.
   * @return {Array} Array of directories names.
   */
  getDirectories(srcpath) {
      return fs.readdirSync(srcpath).filter(function(file) {
          return fs.statSync(path.join(srcpath, file)).isDirectory();
      });
  }

  /**
   * Load skills from skills folder (on bot start).
   */
  loadSkillsFromFolder() {
    let skillsFolders;
    try {
      console.log(`> [INFO] Loading skills directory: "\x1b[4m${"/skills"}\x1b[0m"...`);
      skillsFolders = this.getDirectories(this.skillsDirectory)
      console.log(`> [INFO] Skills folders found: \x1b[33m${skillsFolders.join(", ")}\x1b[0m.`);
    } catch(e) {
      console.log(e.stack);
    }

    /**
      Load skills on module require (bot start).
    */
    let skillsToLoad = skillsFolders;

    this.loadSkills(skillsToLoad);
  }

  /**
   * Activate a skill after reloading it..
   * @param {String} skillName The name of the skill to activate + reload.
   * @return {Promise} Promise object resolve if success, reject otherwise.
   */
  activateSkill(skillName) {
    return new Promise((resolve, reject) => {
      this.reloadSkill(skillName).then(() => {
        this.skills.get(skillName).active = true;
        let skill = this.skills.get(skillName);
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
  }

  /**
   * Deactivate a skill.
   * @param {String} skillName The name of the skill to deactivate.
   * @return {Promise} Promise object resolve if success, reject otherwise.
   */
  deactivateSkill(skillName) {
    return new Promise((resolve, reject) => {
      try {
        this.skills.get(skillName).active = false;
        let skill = this.skills.get(skillName);
        for (let intentName in skill.intents) {
          skill.intents[intentName].active = false;
        }
        for (let commandName in skill.commands) {
          skill.commands[commandName].active = false;
        }
        for (let interactionName in skill.interactions) {
          skill.interactions[interactionName].active = false;
        }
        return resolve();
      } catch(e) {
        return reject(e);
      }
    })
  }

  /**
   * Get a skill's code.
   * @param {String} skillName - The name of the skill to get code of.
   * @return {Promise} Promise object represents the skill's code.
   */
  getSkillCode(skillName) {
    return new Promise((resolve, reject) => {
      if (this.skills.has(skillName)) {
        fs.readFile(path.join(this.skillsDirectory, `/${skillName}/skill.js`), 'utf8', (err, data) => {
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

  /**
   * Save a skill's code before saving it.
   * @param {String} code - The code of the skill to validate.
   * @return {Promise} Promise object (true, null) if validated, (false, string reason) otherwise.
   */
  validateSkillCode(code) {
    return new Promise((resolve, reject) => {
      // TODO: Validate skill code.
      
      let [matched, name, author, date, commands, intents, interactions, dependencies, logic, ...rest] = new RegExp(skillTemplateRegex, "g").exec(code) || [null, null, null, null, null, null, null, null, null, null];
      if (matched == null || matched.length == 0) {
        return resolve(false, "Skill template didn't match.");
      }

      return resolve(true, null);
    });
  }

  /**
   * Save a skill's code.
   * @param {String} skillName - The name of the skill where to save code.
   * @param {String} code - The code of the skill to save.
   * @return {Promise} Promise object resolves if success, reject otherwise.
   */
  saveSkillCode(skillName, code) {
    return new Promise((resolve, reject) => {
      this.validateSkillCode(code).then((success, reason) => {
        // TODO: Validate skill code instead of TRUE...
        
        if (true) { // eslint-disable-line no-constant-condition
          console.log(`> [INFO] Saving code of skill \x1b[33m${skillName}\x1b[0m...`);
          fs.writeFile(path.join(this.skillsDirectory, `/${skillName}/skill.js`), code, 'utf8', (err) => {
            if (err) {
              console.log(err);
              return reject();
            }

            console.log(`\t... Reload skill.`);

            this.reloadSkill(skillName).then(() => {
              return resolve();
            }).catch((err) => {
              console.log(err);
              return reject();
            });
          });
        } else {
          return reject(new Error("Skill code is not valid : " + reason || ""));
        }
      }).catch((err) => {
        console.log(err);
        return reject(new Error("Skill code is not valid."));
      });
    });
  }

  /**
   * Add a new skill.
   * @param {Object} skill - The skill to add.
   * @param {String} skill.name - The name of a skill.
   * @param {String} skill.code - The code of a skill.
   * @param {Array[]} secret - An array of key-value pair arrays to store secretly for this skill.
   * @return {Promise} Promise object resolves if success, reject otherwise.
   */
  addSkill(skill) {
    return new Promise((resolve, reject) => {

      // TODO: Check skill definition and skill code.
      this.validateSkillCode(skill.code).then((success, reason) => {
        console.log(`> [INFO] Adding code of skill \x1b[33m${skill.name}\x1b[0m...`);
        console.log(`\t... Create ${skill.name} folder...`)
        fs.mkdir(path.join(this.skillsDirectory, `/${skill.name}`), (err) => {
          if (err) {
            console.log(err);
            return reject({ title: "Could not create folder.", message: "Could not create skill folder on server." });
          }
          console.log(`\t... Create skill.js in ${skill.name} folder...`)
          fs.writeFile(path.join(this.skillsDirectory, `/${skill.name}/skill.js`), skill.code, (err) => {
            if (err) {
              console.log(err);
              return reject({ title: "Could not create skill.js file.", message: "Could not create skill.js file on server." });
            }

            if (skill.secret) {
              console.log(`\t... Create secret.js in ${skill.name} folder...`)
              fs.writeFile(path.join(this.skillsDirectory, `/${skill.name}/secret.js`), "{}", (err) => {
                if (err) {
                  console.log(err);
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
      }).catch((err) => {
        console.log(err);
        return reject({ title: "Could not validate skill code.", message: "Could not validate skill code." });
      });
    });
  }

  /**
   * Remove a skill.
   * @param {String} skillName - The name of the skill to remove.
   * @return {Promise} Promise object resolves if success, reject otherwise.
   */
  deleteSkill(skillName) {
    return new Promise((resolve, reject) => {
      console.log(`> [INFO] Deleting skill \x1b[33m${skillName}\x1b[0m...`);

      console.log(`\tRemoving skill \x1b[33m${skillName}\x1b[0m...`);
      console.log(`\tRemoving associated Intents...`);
      let skill = this.skills.get(skillName);
      if (skill.intents) {
        for (let intent in skill.intents) {
          console.log("\t\tRemoving " + intent);
          this.intents.remove(skill.intents[intent].slug);
        }
      }

      console.log(`\tRemoving linked Commands...`);
      if (skill.commands) {
        for (let command in skill.commands) {
          console.log("\t\tRemoving " + command);
          this.commands.remove(command);
        }
      }

      console.log(`\tRemoving linked interactions...`);
      if (skill.interactions) {
        for (let interaction in skill.interactions) {
          console.log("\t\tRemoving " + interaction);
          this.interactions.remove(interaction);
        }
      }

      console.log(`\tRemoving skill...`);
      this.skills.remove(skillName);
      console.log(`> [INFO] Skill \x1b[33m${skillName}\x1b[0m successfully removed.`);

      console.log(`> [INFO] Clearing cache for skill \x1b[33m${skillName}\x1b[0m`);
      delete require.cache[require.resolve(path.join(this.skillsDirectory, `/${skillName}/skill`))];

      console.log(`> [INFO] Removing files for skill \x1b[33m${skillName}\x1b[0m...`);
      try {
        this.deleteFolderRecursive(path.join(this.skillsDirectory, "/" + skillName));
        console.log(`> [INFO] Successfully removed folder ${"/skills/" + skillName}`);
        return resolve();
      } catch(e) {
        return reject({ message: "Could not delete folder " + "/skills/" + skillName });
      }
    });
  }

 /**
  * List all skills.
  * @return {Promise} Promise object represents the list of skills.
  */
  getSkills() {
    return new Promise((resolve, reject) => {
      return resolve(this.skills.skills);
    });
  }

 /**
  * Check if the skill exists.
  * @param {String} skillName - The name of the skill to check.
  * @return {Boolean} true of false depending on skill's existence.
  */
  hasSkill(skillName) {
    return this.skills.has(skillName);
  }

  /**
   * Get a specific skill.
   * @param {String} skillName - The name of the skill to get.
   * @return {Promise} Promise object represents the skill.
   */
  getSkill(skillName) {
    return new Promise((resolve, reject) => {
      if (this.skills.has(skillName)) {
        return resolve(this.skills.get(skillName));
      } else {
        return resolve(null);
      }
    });
  }

  /**
   * Delete everything in a folder (recursive, including the folder).
   * @param {String} path - folder to remove.
   */
  deleteFolderRecursive(path) {
    if (fs.existsSync(path)) {
      fs.readdirSync(path).forEach(function(file, index){
        var curPath = path + "/" + file;
        if (fs.lstatSync(curPath).isDirectory()) { // recurse
          this.deleteFolderRecursive(curPath);
        } else { // delete file
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(path);
    }
  }

  /**
   * Get secrets for a skill.
   * @param {String} skillName - The name of the skill to get secret of.
   * @return {Promise} Promise to the secret array of key-value pair.
   */
  getSkillSecret(skillName) {
    return new Promise((resolve, reject) => {
      if (this.skills.has(skillName)) {
        if (fs.existsSync(path.join(this.skillsDirectory, `/${skillName}/secret.js`))) {
          delete require.cache[require.resolve(path.join(this.skillsDirectory, `/${skillName}/secret`))];
          const secrets = require(path.join(this.skillsDirectory, `/${skillName}/secret`));
          let secret = [];
          for (let [key, value] of Object.entries(secrets)) {
            secret.push([key, value]);
          }
          return resolve(secret);
        } else {
          return resolve([]);
        }
      } else {
        return resolve(null);
      }
    });
  }

  /**
   * Update a skill's secrets.
   * 
   * @param {String} skillName - The name of the skill to update secret of.
   * @param {Array} secrets - Key-value apir array.
   */
  updateSkillSecret(skillName, secrets) {
    return new Promise((resolve, reject) => {
      if (this.skills.has(skillName)) {
        let secret = {};
        for (let [key, value] of secrets) {
          if (key.length > 0) {
            // Don't retain empty keys.
            secret[key] = value;
          }
        }

        console.log(`> [INFO] Saving secret of skill \x1b[33m${skillName}\x1b[0m...`);
        let filePath = path.join(this.skillsDirectory, `/${skillName}/secret.js`);
        let stream = fs.createWriteStream(filePath);
        stream.on("error", (error) => {
            console.log(error);
            return reject();
        });
        stream.on("finish", () => {
          console.log(`\t... Reload skill.`);

          delete require.cache[require.resolve(filePath)];
          this.reloadSkill(skillName).then(() => {
            return resolve();
          }).catch((err) => {
            console.log(err.stack);
            return reject();
          });
        });
        stream.write(`module.exports = ${JSON.stringify(secret)};`, 'utf8');
        stream.end();
      } else {
        return reject({ code: 404, message: "No skill named " + skillName });
      }
    });
  }
}
