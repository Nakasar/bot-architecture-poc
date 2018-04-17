const request = require('request');
const api_host = process.env.API_HOST || "localhost";
const api_port = process.env.API_PORT || "8080";
const api_url = `http://${api_host}:${api_port}`;

const thread = require('./thread');

function parser(room, message) {
  let formatted = {
    channel: room,
    attachments: []
  };
  if (message.text) {
    let attachment = {
      text: message.text
    };
    if (message.title) {
      attachment.title = message.title;
    }
    formatted.attachments.push(attachment);
  }
  if (message.avatar) {
    formatted.avatar = message.avatar;
  }
  if (message.emoji) {
    formatted.emoji = message.emoji;
  }
  if (message.attachments) {
    for (let attachment of message.attachments) {
      let formattedAttachment = {};
      if (attachment.color) {
        formattedAttachment.color = attachment.color;
      }
      if (attachment.thumbnail) {
        formattedAttachment.thumb_url = attachment.color;
      }
      if (attachment.text) {
        formattedAttachment.text = attachment.text;
      }
      if (attachment.collapsed) {
        formattedAttachment.collapsed = attachment.collapsed;
      }
      if (attachment.author_name) {
        formattedAttachment.author_name = attachment.author_name;
      }
      if (attachment.author_link) {
        formattedAttachment.author_link = attachment.author_link;
      }
      if (attachment.author_icon) {
        formattedAttachment.author_icon = attachment.author_icon;
      }
      if (attachment.title) {
        formattedAttachment.title = attachment.title;
      }
      if (attachment.title_link) {
        formattedAttachment.title_link = attachment.title_link;
      }
      if (attachment.image_url) {
        formattedAttachment.image_url = attachment.image_url;
      }
      if (attachment.audio_url) {
        formattedAttachment.audio_url = attachment.audio_url;
      }
      if (attachment.video_url) {
        formattedAttachment.video_url = attachment.video_url;
      }
      // TODO: Parse fields
      formatted.attachments.push(formattedAttachment);
    }
  }
  //console.log(formatted);
  return formatted;
};

module.exports = function (robot) {
  robot.hear(/!(.*)/, function (message) {
    let command = message.match[1];
    var uri = "/command";
    thread.checkThread(command, message.message.room)
      .then((thread_id) => {
        if (thread_id) {
          var phrase = command.split(' ');
          phrase.splice(0, 1);
          phrase = phrase.join(' ');
          if (phrase === '') {
            return message.send(">Entrez votre message après la commande");
          }
          var uri = '/converse';
          var body_thread = {
            thread_id: thread_id,
            phrase: phrase,
            token: "59az4dazdaz4d86az4dazd"
          }
          console.log("Phrase envoyé " + phrase);
        }
        else {
          var uri = '/command';
          var body_thread = {
            command: command,
            token: "59az4dazdaz4d86az4dazd"
          }
        }
        request({
          baseUrl: api_url,
          uri: uri,
          method: "POST",
          json: true,
          body: body_thread,
          callback: (err, res, body) => {
            if (!err && body.message) {
              console.log("Message reçu ! ");
              thread.handleThread(thread_id, body.message.thread_id, message.message.room, command, body.message.interactive)
                .then(() => {
                  robot.messageRoom(
                    message.message.room,
                    parser(message.message.room, body.message)
                  );
                });
            } else {
              message.send("An error occured :'(");
            }
          }

        });
      });
  });

  robot.respond(/(.*)/, function (message) {
    let phrase = message.match[1];

    if (phrase.startsWith("!")) {
      return;
    }
    thread.checkThread('nlp nlp', message.message.room)
      .then((thread_id) => {
        if(thread_id){
          var uri = "/converse";
          var body_thread = {
            thread_id: thread_id,
            phrase: phrase,
            token: "59az4dazdaz4d86az4dazd"
          }
          console.log("Message type Converse sent");
        }
        else{
          var uri = "/nlp";
          var body_thread = {
            phrase: phrase,
            token: "59az4dazdaz4d86az4dazd"
          }
          console.log("Message typ Nlp sent");
        }
        console.log("Catched: " + phrase);
        request({
          baseUrl: api_url,
          uri: uri,
          method: "POST",
          json: true,
          body: body_thread,
          callback: (err, res, body) => {
            if (!err && body.message) {
              thread.handleThread(thread_id, body.message.thread_id, message.message.room, 'nlp', body.message.interactive)
                .then(() => {
                  robot.messageRoom(
                    message.message.room,
                    parser(message.message.room, body.message)
                  );
                });
            } else {
              message.reply("An error occured :'(");
            }
          }
        });
        message.reply();
      });
  })
};
