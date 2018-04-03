const skillNameRegex = /^[a-z\\-]{3,20}$/;

class Skill {
  constructor() {
    this.name = undefined;
    this.intents = {};
    this.commands = {};
    this.dependencies = [];
    this.code = "";
    this.author = undefined;
    this.secret = {};
  }

  generateCode() {
    let commands = "{}";

    let dependencies = "[";
    for (let i = 0; i < this.dependencies.length; i++) {
      dependencies += `"${this.dependencies[i]}"${i < this.dependencies.length - 1 ? ", " : ""}`;
    }
    dependencies += "]";
    let code = `
/*
  SKILL : ${this.name || "new-skill"}
  AUTHOR : ${this.author || "Anonymous"}
  DATE : ${(new Date()).toLocaleDateString()}
*/

/*
  You should not modify this part unless you know what you're doing.
*/
// Defining the skill
// Commands the skill can execute.
/* <SKILL COMMANDS> */
let commands = ${this.commandString};
/* </SKILL COMMANDS> */

// intents the skill understands.
/* <SKILL INTENTS> */
let intents = ${this.intentString};
/* </SKILL INTENTS> */

// dependencies of the skill.
/* <SKILL DEPENDENCIES> */
let dependencies = ${dependencies};
/* </SKILL DEPENDENCIES> */

// Exposing the skill definition.
exports.commands = commands;
exports.intents = intents;
exports.dependencies = dependencies;

/*
  Skill logic begins here.
  You must implements the functions listed as "execute" and "handle" handler, or your skill will not load.
*/
/* <SKILL LOGIC> */

/* </SKILL LOGIC> */

// You may define other logic function unexposed here. Try to keep the skill code slim.
    `.trim();
    this.code = code;
    return code;
  }

  setName(name) {
    this.name = name;
  }

  /**
    Generate the skill using a template (or from scratch).
  */
  generate(name, template, skills) {
    return new Promise((resolve, reject) => {
      // Check if name is available.
      let trueName = name.toLowerCase();

      if (!skillNameRegex.test(trueName)) {
        return reject({ title: "Invalid skill name.", message: "Name must be lower-case, contain only letters and -."})
      }

      if (Object.keys(skills).includes(trueName)) {
        return reject({ message: "Skill name " + name + " already in use." });
      }

      this.name = name;
      this.dependencies = [];
      this.intents = {};
      this.commands = {};

      switch (template) {
        case "API request":
          this.dependencies = ['request'];
          this.generateCode();
          break;
        default:
          this.generateCode();
          break;
      }

      return resolve();
    });
  }

  /**
    Adds the command to the skill and updates editor.

    Params :
    --------
    command:
      {
        name: String,
        cmd: String,
        execute: String
      }
  */
  addCommand(command) {
    return new Promise((resolve, reject) => {
      // Checks command validity

      // cmd unicity
      // Check in the new edited skill
      for (let com in this.commands) {
        if (this.commands[com].cmd === command.cmd) {
          return reject({
            title: "Command word already used.",
            message: `The command word must be unique to the bot, or conflicts will arise. (Used in this skill).`
          });
        }
      }
      // Check in all skills
      for (let skillName in skills) {
        for (let com in skills[skillName].commands) {
          if (skills[skillName].commands[com].cmd === command.cmd) {
            return reject({
              title: "Command word  already used.",
              message: `The command word must be unique to the bot, or conflicts will arise. (Used in skill ${skillName}).`
            });
          }
        }
      }

      // handler validity
      const functionRegex = /^[a-zA-Z]{3,40}$/;
      if (!functionRegex.test(command.execute)) {
        return reject({
          title: "Invalid handler name.",
          message: "The handler name must follow camelLowerCase (and souldn't contain digits)."
        });
      }

      // Command is valid


      // Add intent to skill and to code
      this.commands[command.name] = command;

      // Add intent definition
      this.code = this.code.replace(/let commands = {(.*|\r|\n|\u2028|\u2029){0,}?};/, `let commands = ${this.commandString};`);

      // Add handler
      let handlerString = `/**
  Handler for command ${command.name} (!${command.cmd}).

  Params :
  --------
    phrase: String
*/
function ${command.execute}(phrase) {
  return new Promise((resolve, reject) => {
    /*
      >>> YOUR CODE HERE <<<
      resolve the handler with a formatted message object.
    */
    return resolve({
      title: "Not implemented",
      message: "This functionnality is currently not implemented."
    });
  });
}`;
      this.code = this.code.replace(/\/\* <\/SKILL LOGIC> \*\//, "\n" + handlerString + "\n/* </SKILL LOGIC> */");

      editor.setValue(this.code);
      editor.session.setValue(this.code);
      editor.clearSelection();

      return resolve();
    });
  }

  /**
    Adds the intent to the skill and updates editor.

    Params :
    --------
    intent:
      {
        name: String
        slug: String
        handler: String
        expected_entities: [String]
      }
  */
  addIntent(intent) {
    return new Promise((resolve, reject) => {
      // Checks intent validity

      // name unicity
      // Check in the new edited skill
      if (Object.keys(this.intents).includes(intent.name)) {
        // intent name already in use, abort and alert.
        return reject({
          title: "Intent name already in use.",
          message: `The name of the intent must be unique to the bot. (Used in this skill).`
        });
      }
      // Check in all skills
      for (let skillName in skills) {
        if (Object.keys(skills[skillName].intents).includes(intent.name)) {
          // intent name already in use, abort and alert.
          return reject({
            title: "Intent name already in use.",
            message: `The name of the intent must be unique to the bot. (Used in skill ${skillName}).`
          });
        }
      }

      // slug unicity
      // Check in the new edited skill
      for (let int in this.intents) {
        if (this.intents[int].slug === intent.slug) {
          return reject({
            title: "Slug already used.",
            message: `The slug of the intent must be unique to the bot, or conflicts will arise. (Used in this skill).`
          });
        }
      }
      // Check in all skills
      for (let skillName in skills) {
        for (let int in skills[skillName].intents) {
          if (skills[skillName].intents[int].slug === intent.slug) {
            return reject({
              title: "Slug already used.",
              message: `The slug of the intent must be unique to the bot, or conflicts will arise. (Used in skill ${skillName}).`
            });
          }
        }
      }

      // entities validity
      const entityRegex = /^[a-zA-Z\\-]{2,40}$/;
      for (let entity of intent.expected_entities) {
        if (!entityRegex.test(entity)) {
          return reject({
            title: `Invalid entity name : ${entity}.`,
            message: "A valid entity name has no space, no underscore, and no digit."
          });
        }
      }

      // handler validity
      const functionRegex = /^[a-zA-Z]{3,40}$/;
      if (!functionRegex.test(intent.handle)) {
        return reject({
          title: "Invalid handler name.",
          message: "The handler name must follow camelLowerCase (and souldn't contain digits)."
        });
      }

      // Intent is valid


      // Add intent to skill and to code
      this.intents[intent.name] = intent;

      // Add intent definition
      this.code = this.code.replace(/let intents = {(.*|\r|\n|\u2028|\u2029){0,}?};/, `let intents = ${this.intentString};`);

      // Add handler
      let paramsString = `{`;
      for (let entity of intent.expected_entities) {
        paramsString += ` '${entity}': ${entity.replace("-", "")} = {}`
        if (intent.expected_entities.indexOf(entity) < intent.expected_entities.length - 1) {
          paramsString += ","
        }
      }
      paramsString += '}'
      let handlerString = `/**
  Handler for intent ${intent.name} (${intent.slug}).

  Params :
  --------
    entities (Object)
*/
function ${intent.handle}(${paramsString}) {
  return new Promise((resolve, reject) => {
    /*
      >>> YOUR CODE HERE <<<
      resolve the handler with a formatted message object.
    */
    return resolve({
      title: "Not implemented",
      message: "This functionnality is currently not implemented."
    });
  });
}`;
      this.code = this.code.replace(/\/\* <\/SKILL LOGIC> \*\//, handlerString + "\n/* </SKILL LOGIC> */");

      editor.setValue(this.code);
      editor.session.setValue(this.code);
      editor.clearSelection();

      return resolve();
    });
  }

  get intentString() {
    let intentString = "{"
    for (let intentName in this.intents) {
      let intent = this.intents[intentName];
      let entities = "[";
      for (let i = 0; i < intent.expected_entities.length; i++) {
        entities += `"${intent.expected_entities[i]}"${i < intent.expected_entities.length - 1 ? ", " : ""}`;
      }
      entities += "]";
      intentString += `
  '${intent.name}': {
    slug: "${intent.slug}",
    handle: ${intent.handle},
    expected_entities: ${entities}
  }`;
      if (Object.keys(this.intents).indexOf(intentName) < Object.keys(this.intents).length - 1) {
        intentString += ","
      }
    }
    intentString += "\n}"
    return intentString;
  }

  get commandString() {
    let commandString = "{"
    for (let commandName in this.commands) {
      let command = this.commands[commandName];
      commandString += `
  '${command.name}': {
    cmd: "${command.cmd}",
    execute: ${command.execute}
  }`;
      if (Object.keys(this.commands).indexOf(commandName) < Object.keys(this.commands).length - 1) {
        commandString += ","
      }
    }
    commandString += "\n}"
    return commandString;
  }
}

function showEditor() {
  $("#code-alert").hide();
  $("#editor").show();
}

$("#skill-generate").submit(function(event) {
  var id = event.target.id;
  console.log("Generate new skill");
  event.preventDefault();

  $('#skill-generate').hide();

  let skillName = $(`#${id} #skill-name`).val();
  let skillTemplate = $(`#${id} #skill-template`).val();

  skill.generate(skillName, skillTemplate, skills).then(() => {
    $("main h1").text(skill.name);
    $("#skill-toolbox").show();
    $("#left-panel").removeClass("col-md-4");
    $("#left-panel").addClass("col-md-2");
    $("#middle-panel").removeClass("col-md-6");
    $("#middle-panel").addClass("col-md-8");
    let notificationId = notifyUser({
      title: "Skill generated!",
      message: "You can add commands and intents using the left-side panel.",
      type: "success",
      delay: 2
    });
    editor.setValue(skill.code);
    editor.clearSelection();
    showEditor();
  }).catch((err) => {
    $('#skill-generate').show();
    notifyUser({
      title: err.title || "Can't create skill.",
      message: err.message,
      type: "error"
    });
  });
});

function addIntent() {
  $("#add-intent-alert").empty();
  $('#add-intent-form #intent-name').val('');
  $('#add-intent-form #intent-slug').val('');
  $('#add-intent-form #intent-entities').val('');
  $('#add-intent-form #intent-handler').val('');
  $('#add-intent-modal').modal('show');
};

function displayAddIntentAlert({ title = "Error", message = "Couldn't create intent." }) {
  $("#add-intent-alert").empty();
  $("#add-intent-alert").append(`
    <div class="alert alert-warning alert-dismissible fade show" role="alert">
      <h4 class="alert-heading">${title}</h4>
      <p>${message}</p>
      <button class="close" type="button" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
  `.trim());
};

$("#add-intent-form").submit(function(event) {
  event.preventDefault();
  // Parsing new intent
  let name = $('#add-intent-form #intent-name').val();
  if (!name.startsWith(skill.name + "-")) {
    name = skill.name + "-" + name;
  }
  let slug = $('#add-intent-form #intent-slug').val();
  let entityVal = $('#add-intent-form #intent-entities').val();
  let entities = entityVal.length > 0 ? entityVal.split(", ") : [];
  let handler = $('#add-intent-form #intent-handler').val();

  let intent = {
    name: name,
    slug: slug,
    handle: handler,
    expected_entities: entities
  };

  // SUCCESS ! Let's add the intent to the code
  skill.addIntent(intent).then(() => {
    $("#add-intent-modal").modal("hide");
  }).catch((err) => {
    displayAddIntentAlert(err);
  });
});

function addCommand() {
  $("#add-command-alert").empty();
  $('#add-command-form #command-name').val('');
  $('#add-command-form #command-word').val('');
  $('#add-command-form #command-handler').val('');
  $('#add-command-modal').modal('show');
};

function displayAddCommandAlert({ title = "Error", message = "Couldn't create command." }) {
  $("#add-command-alert").empty();
  $("#add-command-alert").append(`
    <div class="alert alert-warning alert-dismissible fade show" role="alert">
      <h4 class="alert-heading">${title}</h4>
      <p>${message}</p>
      <button class="close" type="button" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
  `.trim());
};

$("#add-command-form").submit(function(event) {
  event.preventDefault();
  // Parsing new intent
  let name = $('#add-command-form #command-name').val();
  let word = $('#add-command-form #command-word').val();
  let handler = $('#add-command-form #command-handler').val();

  let command = {
    name: name,
    cmd: word,
    execute: handler
  };

  // SUCCESS ! Let's add the intent to the code
  skill.addCommand(command).then(() => {
    $("#add-command-modal").modal("hide");
  }).catch((err) => {
    displayAddCommandAlert(err);
  });
});

function configureSecret() {
  notifyUser({
    title: "Not implemented.",
    message: "You can't modify secret yet.",
    type: "warning",
    delay: 2
  });
};

$("#save-skill").click(function() {
  skill.code = editor.getValue();

  if ($('#edited-skill-data').data('edit-skill')) {
    let notificationId = notifyUser({
      title: "Saving skill...",
      message: "We are pushing your skill, please wait.",
      type: "info",
      delay: -1
    });

    $.ajax({
      method: "PUT",
      baseUrl: base_url,
      url: "/skills/" + skill.name + "/edit",
      data: { code: skill.code },
      dataType: "json",
      success: function(json) {
        console.log(json);
        dismissNotification(notificationId);
        if (json.success) {
          notifyUser({
            title: "Skill pushed!",
            message: `Your skill ${skill.name} is updated and running!`,
            type: "success",
            delay: 5
          });
        } else {
          notifyUser({
            title: `Can't push ${skill.name}`,
            message: json.message,
            type: "error",
            delay: 5
          });
        }
      },
      error: function(err) {
        dismissNotification(notificationId);
        notifyUser({
          title: "Error",
          message: `Couldn't push ${skilljson.name}.`,
          type: "error",
          delay: 5
        });
      }
    })
  } else {
    let skilljson = {
      skill_name: skill.name,
      skill_code: skill.code,
    }

    if (skill.secret) {
      skilljson.skill_secret = skill.secret;
    }

    let notificationId = notifyUser({
      title: "Saving skill...",
      message: "We are pushing your new skill, please wait.",
      type: "info",
      delay: -1
    });

    $.ajax({
      method: "PUT",
      baseUrl: base_url,
      url: "/skills",
      data: skilljson,
      dataType: "json",
      success: function(json) {
        console.log(json);
        dismissNotification(notificationId);
        if (json.success) {
          notifyUser({
            title: "Skill pushed!",
            message: `Your new skill ${skilljson.name} is now running!`,
            type: "success",
            delay: 5
          });
        } else {
          notifyUser({
            title: `Can't push ${skilljson.name}`,
            message: json.message,
            type: "error",
            delay: 5
          });
        }
      },
      error: function(err) {
        dismissNotification(notificationId);
        notifyUser({
          title: "Error",
          message: `Couldn't push ${skilljson.name}.`,
          type: "error",
          delay: 5
        });
      }
    });
  }
});


// Load code editor (hidden).
let editor = ace.edit('editor');
editor.session.setMode('ace/mode/javascript');
editor.setTheme('ace/theme/monokai');


// Init skill edit page
let skill;

// Load current bot skills
let skills = {};
$.ajax({
  method: "GET",
  baseUrl: base_url,
  url: "/skills",
  dataType: 'json',
  success: function(json) {
    if (json.success) {
      skills = json.skills;

      // Fill current skill data or init a new empty skill
      let editedSkillData = $('#edited-skill-data');
      if (editedSkillData.data('edit-skill')) {
        // Retrieve current skill data
        skill = new Skill();
        skill.name = editedSkillData.data('skill-name');
        skill.code = editedSkillData.data('skill-code');

        // Retrieve skill intents and commands
        for (let intentName in skills[skill.name].intents) {
          let intent = skills[skill.name].intents[intentName];
          intent.name = intentName;
          skill.intents[intentName] = intent;
        }

        for (let commandName in skills[skill.name].commands) {
          let command = skills[skill.name].commands[commandName];
          command.name = commandName;
          skill.commands[commandName] = command;
        }

        skill.dependencies = skills[skill.name].dependencies;

        $('#skill-generate').hide();
        $('#skill-toolbox').show();
        $("#left-panel").removeClass("col-md-4");
        $("#left-panel").addClass("col-md-2");
        $("#middle-panel").removeClass("col-md-6");
        $("#middle-panel").addClass("col-md-8");

        editor.setValue(skill.code);
        editor.clearSelection();
        showEditor();
        $('#loader').hide();
        $('#skill-editor').show();
      } else {
        // Init an empty skill
        skill = new Skill();
        $('#loader').hide();
        $('#skill-editor').show();

        // Welcome user on start.
        notifyUser({
          title: "Welcome!",
          message: "To begin building your new skill, you must generate it from a template (or build from scratch).",
          type: "info",
          delay: -1
        });
      }
    }
  },
  error: function(err) {

  }
});
