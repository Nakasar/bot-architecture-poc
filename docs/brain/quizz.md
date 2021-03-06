# Skill Example : API

Here is an example of skill fetching question on a distant quizz API service that uses the Conversation mode.

```javascript
/*
  SKILL : quizz
  AUTHOR : Anonymous
  DATE : 14/05/2018
*/

/*
  You should not modify this part unless you know what you're doing.
*/

// Defining the skill
// Commands the skill can execute.
/* <SKILL COMMANDS> */
let commands = {
  'quizz': {
    cmd: "quizz",
    execute: quizz
  }
};
/* </SKILL COMMANDS> */

// intents the skill understands.
/* <SKILL INTENTS> */
let intents = {
  'quizz-quizz': {
    slug: "quizz",
    handle: handleQuizz,
    expected_entities: []
  }
};
/* </SKILL INTENTS> */

// Conversation handlers of the skill.
/* <SKILL INTERACTIONS> */
let interactions = {
  'thread-quizz-handler': {
    name: "thread-quizz-handler",
    interact: answerHandler
  }
};
/* </SKILL INTERACTIONS> */

// dependencies of the skill.
/* <SKILL DEPENDENCIES> */
let dependencies = ["request"];
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
const request = require('request');

/**
  Handler for command quizz (!quizz).

  Params :
  --------
    phrase: String
*/
function quizz({ phrase }) {
  return new Promise((resolve, reject) => {
    // Retrieve the questions from an API
    request.get({
        url: "https://opentdb.com/api.php?amount=1&difficulty=medium&type=multiple",
        json: "true",
        callback: (err, res, body) => {
            if (!err && body) {
              // Build the question
                  let question = "Quizz:\n*" + body.results[0].question + "*";
                  // Build the answers 
                  let answers = body.results[0].incorrect_answers;
                  answers.push(body.results[0].correct_answer);
                  answers.sort();

                  question += "\n> " + answers.join("\n> ");
                  question += "\n (type `abort` or `skip` to skip)";
                  // return the message with a thread object and an interactive true to create the thread
                  return resolve({
                      message: {
                        // Required to create a thread
                          interactive: true,
                          thread: {
                            // The source is the prase that started the conversation ( optional )
                            source: body.results[0].question,
                            // Additional datas ( optional )
                            data: [
                                ["correct_answer", body.results[0].correct_answer],
                                ["incorrect_answers", body.results[0].incorrect_answers]
                            ],
                            // The handler name ( REQUIRED ), the same as in the interactions object above
                            handler: "thread-quizz-handler",
                            // the time out duration ( optional )
                            duration: 10,
                            // the timeout message that will be printed when the conversation time out ( optional )
                            timeout_message: "Trop tard ! Soit plus rapide la prochaine fois, la bonne réponse était : "+body.results[0].correct_answer,
                          },
                          title: body.results[0].category,
                          text: question
                      }
                  });
            } else {
                return resolve({
                    message: {
                        title: "Cannot fetch quizz",
                        text: "Error while requesting quizz service."
                    }
                });
            }
        }
    });
  });
}
// The function that will be executed when a request is received on the /converse route with the thread id associated to the skill
function answerHandler(thread, { phrase }) {
  return new Promise((resolve, reject) => {
    // Correct answer
    if (phrase === thread.getData("correct_answer")) {
      // no interactive true parameter , so the thread will be closed
        return resolve({
            message: {
                title: "Correct o/",
                text: `${phrase} is the correct answer, congrats!`
            }
        });
    } else if(["abort", "skip"].includes(phrase)) {
      // Abort skip catch
        console.log(thread.getData("attemps"));
        // No interactive true parameter, so the thread will be closed
        return resolve({
            message: {
                title: "Aborting",
                text: `The answer was *${thread.getData("correct_answer")}*. ${thread.getData("attemps") || 0} attemps.`
            }
        });
    } else {
      console.log(thread.getData("attemps"));
      thread.setData("attemps", (thread.getData("attemps") || 0) + 1);
      // Wrong answer, interactive true parameter to continue the conversation
      return resolve({
          message: {
              interactive: true,
              title: "Wrong :(",
              text: `${phrase} is not the expected answer, try again!`
          }
      });
    }
  });
}
/**
  Handler for intent quizz-quizz (quizz).

  Params :
  --------
    entities (Object)
*/
function handleQuizz({ entities = {}, phrase, data }) {
  return quizz({ phrase });
}
/* </SKILL LOGIC> */

// You may define other logic function unexposed here. Try to keep the skill code slim.
```