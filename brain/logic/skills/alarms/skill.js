/*
  SKILL : alarms
  AUTHOR : Anonymous
  DATE : 20/04/2018
*/

/*
  You should not modify this part unless you know what you're doing.
*/

// Defining the skill
// Commands the skill can execute.
/* <SKILL COMMANDS> */
let commands = {
  'alarm': {
    cmd: "alarm",
    execute: alarmHandler
  }
};
/* </SKILL COMMANDS> */

// intents the skill understands.
/* <SKILL INTENTS> */
let intents = {
};
/* </SKILL INTENTS> */

// Conversation handlers of the skill.
/* <SKILL INTERACTIONS> */
let interactions = {
  'confirmation': {
    name: "confirmation",
    interact: handleConfirmation
  }
};
/* </SKILL INTERACTIONS> */

// dependencies of the skill.
/* <SKILL DEPENDENCIES> */
let dependencies = [];
/* </SKILL DEPENDENCIES> */

// Exposing the skill definition.
exports.commands = commands;
exports.intents = intents;
exports.dependencies = dependencies;
exports.interactions = interactions;

/*
  Skill logic begins here.
  You must implements the functions listed as "execute" and "handle" handler, or your skill will not load.
*/
/* <SKILL LOGIC> */
const overseer = require('../../overseer');

/**
  Handler for command alarm (!alarm).

  Params :
  --------
    phrase: String
*/
function alarmHandler({ phrase, data }) {
  return new Promise((resolve, reject) => {
    overseer.StorageManager.storeItem(
      "alarm",
      "time123",
      {
        hour: phrase.split(':')[0],
        minutes: phrase.split(':')[1]
      }
    ).then(() => {
      overseer.ThreadManager.addThread({
          timestamp: new Date(),
          source: phrase,
          data: [
              ["at", phrase]
          ],
          handler: "confirmation"
      }).then((thread) => {
         return resolve({
             message: {
                 interactive: true,
                 thread_id: thread._id,
                 title: "Set a alarm.",
                 text: `Will set an alarm for ${phrase}, is that correct ? (o/N)`
             }
         });
      }).catch((e) => {
        return resolve({
            message: {
                title: "Cannot create alarm.",
                text: "Error while creating thread."
            }
        });
      });
    }).catch((err) => {
      console.log(err);
      return reject(err);
    })
  });
}
/**
  Handler for interaction confirmation.

  Params :
  --------
    phrase: String
*/
function handleConfirmation(thread, { phrase, data }) {
  return new Promise((resolve, reject) => {
    overseer.StorageManager.getItem("alarm", "time123").then((time) => {
      // Close Thread.
      let response = "Aborted";
      if (["oui", "yes", "o", "oui!", "yes!"].includes(phrase)) {
          response = "Ok! Alarm set for " + time
      }
      overseer.ThreadManager.closeThread(thread._id).then(() => {
          return resolve({
              message: {
                  title: "Alarm",
                  text: response
              }
          });
      }).catch((e) => {
          return resolve({
              message: {
                  title: "Alarm",
                  text: response
              }
          });
      });
    }).catch((err) => {
      console.log(err);
      return reject(err);
    })
  });
}
/* </SKILL LOGIC> */

// You may define other logic function unexposed here. Try to keep the skill code slim.
