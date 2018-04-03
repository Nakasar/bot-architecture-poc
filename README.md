# PoC : Bot Architecture
> Proof of Concept of a Bot Architecture using microservices and skills.

## Install
### Classical installation
- You must have a local installation of [NodeJS](https://nodejs.org) _(Tested for v9.9.0)_ with npm.
- Clone this repository using `git clone https://github.com/Nakasar/bot-architecture-poc`.
- Move into the brain folder: `cd bot-architecture-poc/brain`.
- Install npm modules with `npm install`.
- Add the connect information to the database in `brain/database/secret.js`, exporting a valid `host` string for mongodb (atlas, or even local if you have mongodb running on your computer).
- Add a secret variable for tokens in `brain/dashboard/secret.js`, exporting a `secret` string.
- Run the brain with `npm start`.
- _Optional : run microservices at will using `npm install` and `npm start`._

> You can access the administration dashboard at [localhost:8080/dashboard](localhost:8080/dashboard). Setup admin user with [localhost:8080/dashboard/setup](localhost:8080/dashboard/setup), username is _Nakasar_ and password is _Password0_.

> Nota Bene: In order to use the nlp skill, you must add a `secret.js` file in the `brain/logic/skills/nlp` folder exporting a `recastai_token` with your recast ai token. (Or you may recode a new nlp skill exposing an `analyse` command).

### Docker install
- Clone the repo.
- Clone this repository using `git clone https://github.com/Nakasar/bot-architecture-poc`.
- Modify the `base_url` const in `dashboard/public/js/main.js` to: `127.0.0.1:3012` if you are running docker in a VM, `127.0.0.1:49160` other white.
- Add the connect information to the database in `brain/database/secret.js`, exporting a valid `host` string for mongodb (atlas, or even local if you have mongodb running on your computer) _(ex: `nano brain/database/secret.js`, add `module.exports = { host: 'localhost:27017/mydb' }`)_
- Add a secret variable for tokens in `brain/dashboard/secret.js`, exporting a `secret` string.
- Build the Brain image using the Dockerfile, then run in : `docker build . -t nakasar/botbrain` then `docker run -d -p 49160:8080 nakasar/botbrain` _(don't forget to expose port 49160 to access dashboard and brain API!)_
- Run rocketchat server and rocket chat adapter with docker-compose (in `connectors` folder, run `docker-compose up -d`).

> You can access the administration dashboard at [127.0.0.1:49160/dashboard](127.0.0.1:49160/dashboard). Setup admin user with [127.0.0.1:49160/dashboard/setup](localhost:8080/dashboard/setup), username is _Nakasar_ and password is _Password0_.

> Note Bene: If you run docker inside a Virtual Machine, be sure to expose the following ports in your VM software : 3012 <-> 49160 (adapter), 3000 <-> 3000 (rocketchat server). Dashboard will be accessible from [127.0.0.1:3012/dashboard](127.0.0.1:3012/dashboard).

> Nota Bene: In order to use the nlp skill, you must add a `secret.js` file in the `brain/logic/skills/nlp` folder exporting a `recastai_token` with your recast ai token. (Or you may recode a new nlp skill exposing an `analyse` command).

> Nota Bene: If you are using the rocketchat server included, you must create a user names `superbot`, a random email, and password `password` for the bot. Then log out and create another account for you.

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

#### Message formatting
Adapters reformat messages to send rich embeded message (if any) to clients. The brain must send compatible message format.

The simpliest message a skill may return from one of its Promise is the following :
```javascript
resolve({ message: { text: "This is a very simple message." } });
```

You may add some additionnal information to the message object, like a title, or change the message avatar (using the image url instead of bot avatar, or the give emoji, not supported y all adapter!) :
```javascript
resolve({
  message: {
    title: "Hey!",
    avatar: "https://assets-cdn.github.com/images/modules/logos_page/GitHub-Mark.png",
    emoji: ":smirk:",
    text: "This message has an amazing title!"
  }
});
```

**Attachments**
Messages can display several attachments, these are additionnals fields displayed after the message. They can contain images, video, files, buttons, text...

![https://a.slack-edge.com/1877/img/api/message_guidelines/Formatting_1.png](https://a.slack-edge.com/1877/img/api/message_guidelines/Formatting_1.png)

Attachments are listed under the `attachments` array of the message object :
```javascript
resolve({
  message: {
    title: "An incredible message",
    text: "This message is surely the best!",
    attachments: [
      {
        color: "#ff0000",
        text: "This text will have a red border and an alert icon. Cool!",
        thumbnail: "http://www.gohrt.com/images/icons/alert-icon-red.png"
      },
      {
        color: "#00ff00",
        title: "What a video!",
        title_link: "https://www.youtube.com",
        collapsed: true,
        video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        author_name: "Some artist",
        author_link: "http://wikipedia.com"
        author_icon: "https://assets-cdn.github.com/images/modules/logos_page/GitHub-Mark.png"
      },
      {
        title: "What an image!",
        image_url: "https://pre00.deviantart.net/e95b/th/pre/i/2011/267/e/2/french_montain_by_bancomphotos-d4ardpn.jpg"
      },
      {
        color: "#000000",
        title: "Some table",
        text: "Here are a lot of fields!",
        fields: [
          {
            title: "Fun fact 1",
            message: "I lied, it's not a fact."
          },
          {
            title: "Fun fact 2",
            message: "I lied, again."
          }
        ]
      }
      ...
    ]
  }
});
```


#### Skill Example
Here is an example of skill fetching weather on a personnal weather API service:

```javascript
/*
  You should not modify this part unless you know what you're doing.
*/

// Defining the skill
// Commands the skill can execute.
/* <SKILL COMMANDS> */
let commands = {
  weather : {
    cmd: 'weather',
    execute: getWeather,
    expected_args: ['location']
  }
};
/* </SKILL COMMANDS> */

// intents the skill understands.
/* <SKILL INTENTS> */
let intents = {
  'weather-weather': {
    slug: 'weather',
    handle: handleWeather,
    expected_entities: ['location']
  }
};
/* </SKILL INTENTS> */

// dependencies of the skill.
/* <SKILL DEPENDENCIES> */
let dependencies = ['request'];
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
          let weatherMessage = `Here's the weather for *${body.weather.name}*:`
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

function handleWeather({ location: location = "" }) {
  let finalLocation = location[0];
  return getWeather(finalLocation);
}
/* </SKILL LOGIC> */

// You may define other logic function unexposed here. Try to keep the skill code slim.
```
