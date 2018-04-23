const request = require('request');
const api_host = process.env.API_HOST || "localhost";
const api_port = process.env.API_PORT || "8080";
const socket_port = process.env.SOCKET_PORT || "4205";
const api_url = `http://${api_host}:${api_port}`;
const bot_token = process.env.BOT_TOKEN || "";

const thread = require('./thread');
const hookComponent = require('./hook');
const HookManager = new hookComponent.HookManager();

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
  console.log("Init socket with brain.")
  const io = require('socket.io-client');
  const socket = io('http://localhost:5012', {
    autoConnect: true,
    reconnection: true,
    transportOptions: {
      polling: {
        extraHeaders: {
          'x-access-token': bot_token
        }
      }
    }
  });

  socket.on('disconnect', () => {
    console.log("> [WARING] Disconnected from brain!");
  })

  socket.on('hook', (hookId, body) => {
    HookManager.handleHook(hookId, body.message).then(({ room, message }) => {
      robot.messageRoom(room, parser(message.message.room, message.message));
    }).catch((err) => {
      console.log(err);
    });
  });

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
            return message.send("> Entrez votre message après la commande");
          }
          if (!socket.connected) {
            socket.open();
            return message.send("> Impossible de joindre le cerveau.\n_(Si le problème persiste, contactez un administrateur.)_")
          }
          socket.emit('converse', { thread_id, phrase, data: { channel: message.message.room } }, (err, body) => {
            if (err) {
              return message.send("An error occured :'(");
            }

            thread.handleThread(thread_id, body.message.thread_id, message.message.room, command, body.message.interactive)
              .then(() => {
                if (body.message.request_hook) {
                  HookManager.createHook(body.message.hook_id, message.message.room);
                  socket.emit('hook-accept', body.message.hook_id, (error) => {
                    if (error) {
                      console.log(error);
                    } else {
                      console.log("Hook finalized.");
                    }
                  });
                }
                return robot.messageRoom(
                  message.message.room,
                  parser(message.message.room, body.message)
                );
              });
          });
        }
        else {
          if (!socket.connected) {
            socket.open();
            return message.send("> Impossible de joindre le cerveau.\n_(Si le problème persiste, contactez un administrateur.)_")
          }
          socket.emit('command', { command, data: { channel: message.message.room } }, (err, body) => {
            if (err) {
              message.send("An error occured :'(");
            }
            thread.handleThread(thread_id, body.message.thread_id, message.message.room, command, body.message.interactive)
              .then(() => {
                if (body.message.request_hook) {
                  HookManager.createHook(body.message.hook_id, message.message.room);
                  socket.emit('hook-accept', body.message.hook_id, (error) => {
                    if (error) {
                      console.log(error);
                    }
                  });
                }
                return robot.messageRoom(
                  message.message.room,
                  parser(message.message.room, body.message)
                );
              });
          });
        }
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
          if (!socket.connected) {
            socket.open();
            return message.send("> Impossible de joindre le cerveau.\n_(Si le problème persiste, contactez un administrateur.)_")
          }
          socket.emit('converse', { thread_id, phrase, data: { channel: message.message.room } }, (err, body) => {
            if (err) {
              return message.send("An error occured :'(");
            }
            thread.handleThread(thread_id, body.message.thread_id, message.message.room, phrase, body.message.interactive)
              .then(() => {
                if (body.message.request_hook) {
                  HookManager.createHook(body.message.hook_id, message.message.room);
                  socket.emit('hook-accept', body.message.hook_id, (error) => {
                    if (error) {
                      console.log(error);
                    }
                  });
                }
                return robot.messageRoom(
                  message.message.room,
                  parser(message.message.room, body.message)
                );
              });
          });
        }
        else {
          if (!socket.connected) {
            socket.open();
            return message.send("> Impossible de joindre le cerveau.\n_(Si le problème persiste, contactez un administrateur.)_")
          }
          socket.emit('nlp', { phrase, data: { channel: message.message.room } }, (err, body) => {
            if (err) {
              message.send("An error occured :'(");
            }
            thread.handleThread(thread_id, body.message.thread_id, message.message.room, phrase, body.message.interactive)
              .then(() => {
                if (body.message.request_hook) {
                  HookManager.createHook(body.message.hook_id, message.message.room);
                  socket.emit('hook-accept', body.message.hook_id, (error) => {
                    if (error) {
                      console.log(error);
                    }
                  });
                }
                return robot.messageRoom(
                  message.message.room,
                  parser(message.message.room, body.message)
                );
              });
          });
        }
      });
  })
};
