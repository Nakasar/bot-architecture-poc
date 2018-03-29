# PoC : Bot Architecture
> Proof of Concept of a Bot Architecture using microservices and skills.

## Install & Usage
- You must have a local installation of [NodeJS](https://nodejs.org) _(Tested for v9.9.0)_ with npm.
- Clone this repository using `git clone https://github.com/Nakasar/bot-architecture-poc`.
- Move into the brain folder: `cd bot-architecture-poc/brain`.
- Install npm modules with `npm install`.
- Add the connect information to the database in `brain/database/secret.js`, exporting a valid `host` string for mongodb (atlas, or even local if you have mongodb running on your computer).
- Add a secret variable for tokens in `brain/dashboard/secret.js`, exporting a `secret` string.
- Run the brain with `npm start`.
- _Optional : run microservices at will using `npm install` and `npm start`._

> You can access the administration dashboard at [localhost:8080/dashboard](localhost:8080/dashboard). Setup admin user with [localhost:8080/dashboard/setup](localhost:8080/dashboard/setup), username is Nakasar and password is Password1.

> Nota Bene: In order to use the nlp skill, you must add a `secret.js` file in the `brain/logic/skills/nlp` folder exporting a `recastai_token` with your recast ai token. (Or you may recode a new nlp skill exposing an `analyse` command).

## Architecture
![Diagram of Architecture](https://github.com/Nakasar/bot-architecture-poc/blob/master/docs/PoC%20Bot%20Architecture%20Diagram.png)

### Bot Connectors
Connectors are basically just pipelines to transfer messages from the chat itself to the bot's brain. All they do is basically handling their own permissions (and self-commands like `join`) and differencing direct commands from natural language requests.

Here is an example of a simple adapter using [Hubot](https://hubot.github.com/) for [RocketChat](https://rocket.chat/).

```javascript
const request = require('request');
const api_url = "http://10.0.2.2:8080";

module.exports = function(robot) {
  robot.hear(/!(.*)/, function(message) {
    let command = message.match[1];
    request({
      baseUrl: api_url,
      uri: "/command",
      method: "POST",
      json: true,
      body: {
        command: command
      },
      callback: (err, res, body) => {
        if (!err && body.message) {
          message.send(body.message);
        } else {
          message.send("An error occured :'(");
        }
      }
    });
  });

  robot.respond(/(.*)/, function(message) {
    let phrase = message.match[1];

    if (phrase.startsWith("!")) {
      return;
    }

    console.log("Catched: " + phrase);
    request({
      baseUrl: api_url,
      uri: "/nlp",
      method: "POST",
      json: true,
      body: {
        phrase: phrase
      },
      callback: (err, res, body) => {
        if (!err && body.message) {
          message.reply(body.message);
        } else {
          message.reply("An error occured :'(");
        }
      }
    });
    message.reply();
  });
};
```

### Skill Services
Skill Services are external microservices that may (or may not) by accessible by other application. One may return weather forecast, another may give informations about collaborators.

### Skills
Skills are small scripts executed by the brain node server. They expose their commands and intents. Skills are automatically loaded by the bot on startup, and may be added at runtime, or removed/disabled.

Here is an example of skill fetching weather on a personnal weather API service:

```javascript
// Defining the skill
// Commands the skill can execute.
let commands = {
  weather : {
    cmd: 'weather',
    execute: getWeather,
    expected_args: ['location']
  }
};
// intents the skill understands.
let intents = {
  'weather-weather': {
    slug: 'weather',
    handle: handleWeather,
    expected_entities: ['location']
  }
};
// dependencies of the skill.
let dependencies = ['request'];

// Exposing the skill definition.
exports.commands = commands;
exports.intents = intents;
exports.dependencies = dependencies;

/*
  Skill logic begins here.
  You must implements the functions listed as "execute" and "handle" handler, or your skill will not load.
*/
const request = require('request');

const serviceURL = "http://localhost:5012";

function getWeather(phrase) {
  return new Promise((resolve, reject) => {

    let location = phrase;
    if (location.length <= 0) {
      return resolve({
        message: `I need a location (like \`Kayl, lu\`).`
      });
    }

    console.log(`> [INFO] {weather} - Get weather for "${location}".`);
    request({
      baseUrl: serviceURL,
      uri: '/weather',
      qs: {
        location: location
      },
      json: true,
      callback: (err, res, body) => {
        if (!err && body && body.success) {
          let weatherMessage = `Here is the current weather for *${body.weather.name}*:`
          weatherMessage += `\nSky: ${body.weather.weather[0].main}`;
          resolve({
            message: weatherMessage
          });
        } else {
          resolve({
            message: "I couldn't load weather for this location :/"
          });
        }
      }
    });
  });
};

// An intent handler might just redirect to a command handler.
function handleWeather({ location: location = "" }) {
  let finalLocation = location[0];
  return getWeather(finalLocation);
}

// You may define other logic function unexposed here. Try to keep the skill code slim.
```
