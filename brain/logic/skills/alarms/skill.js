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
let dependencies = ['node-shedule'];
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
const schedule = require('node-schedule');

/**
  Handler for command alarm (!alarm).

  Params :
  --------
    phrase: String
*/
function alarmHandler({ phrase, data }) {
  return new Promise((resolve, reject) => {
    let time = new Date();
    try {
      // Checking time format.
      let [hours, minutes] = phrase.split(/[:h\-]/i);
      hours = parseInt(hours, 10);
      minutes = parseInt(minutes, 10);
      if (isNaN(hours) || hours < 0 || hours > 24) {
        throw new Error("Invalid hour format.");
      }
      if (isNaN(minutes) || minutes < 0 || minutes >= 60) {
        throw new Error("Invalid minutes format.");
      }
      time.setHours(hours, minutes, 0, 0);
    } catch(e) {
      // Invalid time format.
      return resolve({
        message: {
          title: "Invalid time format",
          text: "Type `!alarm hh:mm` to create a new alarm."
        }
      })
    }

    overseer.ThreadManager.addThread({
        timestamp: new Date(),
        source: phrase,
        data: [
            ["time", time]
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
    let time = new Date(thread.getData("time"));

    // Close Thread.
    let response = "Aborted";
    if (["oui", "yes", "o", "oui!", "yes!"].includes(phrase)) {
        response = "Ok! Alarm set today at " + time.toLocaleTimeString()
    }

    overseer.HookManager.create("alarms").then((hook) => {
      schedule.scheduleJob(time, () => {
        overseer.HookManager.execute(hook._id, {
          message: {
            title: "Alarm",
            text: "An alarm is ringing!",
            hook_id: hook._id
          }
        })
      });
      overseer.ThreadManager.closeThread(thread._id).then(() => {
          return resolve({
              message: {
                  title: "Alarm ",
                  text: response,
                  request_hook: true,
                  hook_id: hook._id
              }
          });
      }).catch((e) => {
          console.log(e);
          return resolve({
              message: {
                  title: "Alarm",
                  text: response,
                  request_hook: true,
                  hook_id: hook._id
              }
          });
      });
    }).catch((err) => {
      console.log(err);
      return reject(err);
    });
  });
}
/* </SKILL LOGIC> */

// You may define other logic function unexposed here. Try to keep the skill code slim.
