/*
  You should not modify this part unless you know what you're doing.
*/

// Defining the skill
// Commands the skill can execute.
/* <SKILL COMMANDS> */
let commands = {
  'thanks': {
    cmd: 'thanks',
    execute: sayThanks,
    expected_args: []
  },
  'greets': {
    cmd: 'greets',
    execute: sayHello,
    expected_args: []
  }
};
/* </SKILL COMMANDS> */

// intents the skill understands.
/* <SKILL INTENTS> */
let intents = {
  'greetings-say-hello': {
    slug: 'say-hello',
    handle: handleHello,
    expected_entities: []
  },
  'greetings-say-thank': {
    slug: 'say-thanks',
    handle: handleThanks,
    expected_entities: []
  }
};
/* </SKILL INTENTS> */

// dependencies of the skill.
/* <SKILL DEPENDENCIES> */
let dependencies = [];
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
function sayThanks() {
  return new Promise((resolve, reject) => {
    return resolve({
      message: {
        text: "Don't say thanks, idiot!"
      }
    });
  });
}

function sayHello() {
  return new Promise((resolve, reject) => {
    return resolve({
      message: {
        text: "Hello o/"
      }
    });
  });
}

function handleHello() {
  return sayHello();
}

function handleThanks() {
  return sayThanks();
}
/* </SKILL LOGIC> */

// You may define other logic function unexposed here. Try to keep the skill code slim.
