/*
  SKILL : ad-auth
  AUTHOR : Anonymous
  DATE : 03/04/2018
*/

/*
  You should not modify this part unless you know what you're doing.
*/
// Defining the skill
// Commands the skill can execute.
/* <SKILL COMMANDS> */
let commands = {
  'get-ad-token': {
    cmd: "get-ad-token",
    execute: getToken
  }
};
/* </SKILL COMMANDS> */

// intents the skill understands.
/* <SKILL INTENTS> */
let intents = {
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


/**
  Handler for command get-token (!get-token).

  Params :
  --------
    phrase: String
*/
function getToken(phrase) {
  return new Promise((resolve, reject) => {
    console.log(phrase);
    
    return resolve({
      message: {
        title: "Unauthorized",
        text: "You are not allowed to execute this command.",
        color: "red"
      },
      token: "156a81zda6d4dazd5azd4f46az4ad8fa"
    });
  });
}
/* </SKILL LOGIC> */

// You may define other logic function unexposed here. Try to keep the skill code slim.