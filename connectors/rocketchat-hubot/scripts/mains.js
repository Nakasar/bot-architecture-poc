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
