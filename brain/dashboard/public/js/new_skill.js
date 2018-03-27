const skillNameRegex = /^[a-z\\-]{3,20}$/;

class Skill {
  constructor() {
    this.name = undefined;
    this.intents = {};
    this.commands = {};
    this.dependencies = [];
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
          this.dependencies.push('request');
          break;
        default:
          this.dependencies = [];
          break;
      }
    });
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

  let skillName = $(`#${id} #skill-name`).val();
  let skillTemplate = $(`#${id} #skill-template`).val();

  skill.generate(skillName, skillTemplate, skills).then(() => {
    console.log(success);
  }).catch((err) => {
    notifyUser({
      title: err.title || "Can't create skill.",
      message: err.message,
      type: "error"
    });
    console.log(err);
  });
});


// Load code editor (hidden).
let editor = ace.edit('editor');

// Init an empty skill
let skill = new Skill();

// Welcome user on start.
notifyUser({
  title: "Welcome!",
  message: "To begin building your new skill, you must generate it from a template (or build from scratch).",
  type: "info",
  delay: -1
});

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
    }
  },
  error: function(err) {

  }
})
