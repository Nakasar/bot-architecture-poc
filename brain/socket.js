'use strict';
let hub = require('./logic/hub');

module.exports = function(socket) {
  console.log(`> [INFO] Connector ${socket.connector.name} (${socket.connector.id}) connected!`);
  socket.on('disconnect', function(){
    console.log(`> [INFO] Connector ${socket.connector.name} (${socket.connector.id}) disconnected!`);
  });

  socket.on('nlp', ({ phrase = "", data = {} }, res) => {
    if (!phrase) {
      return res({ status: 400 }, {
        success: false,
        message: { text: 'No phrase string to analyze in body.' }
      });
    }

    hub.handleCommand('analyze', phrase, data).then((response) => {
      if (!response.response.intent) {
        return res(null, {
          success: response.success,
          message: {
            text: `It seems I have no skill that could fit your request, maybe it was disabled, I'm sorry :/`
          },
          source: phrase
        });
      }

      hub.handleIntent(response.response.intent, response.response.entities, data).then((response) => {
        return res(null, { success: response.success, message: response.message, source: phrase });
      }).catch((error) => {
        console.log(error)
        return res(null, { success: false, message: { text: 'Unkown error with nlp endpoint.' }, source: phrase });
      })
    }).catch((error) => {
      console.log(error);
      return res(null, { success: false, message: { text: 'Unkown error with nlp endpoint.' }, source: phrase });
    });
  });

  socket.on('command', ({ command = "", data = {} }, res) => {
    if (!command) {
      return res({ status: 500}, { success: false, message: { text: 'No command string to parse in body.' }});
    }

    let [word, ...params] = command.split(" ");

    hub.handleCommand(word, params.join(" "), data).then((response) => {
      return res(null, { success: response.success, message: response.message, source: command });
    }).catch((error) => {
      console.log(error);
      return res(null, { success: false, message: { text: 'Unkown error while handling command.' }, source: command });
    });
  });

  socket.on('converse', ({ thread_id = "", phrase = "", data = {} }, res) => {
    if (!phrase) {
      return res({ status: 400 }, { success: false, message: { text: 'No answer in body/query.' }});
    }

    if (!thread_id) {
      return res({ status: 400 }, { success: false, message: { text: 'No thread_id in body/query.' }});
    }

    hub.ThreadManager.handleThread(thread_id, phrase, data).then((response) => {
      return res(null, { success: true, message: response.message, source: phrase, thread_id });
    }).catch((error) => {
      return res(null, { success: false, message: { text: 'Unkown error while handling conversation in thread.' }, source: phrase, thread_id });
    });
  });

  socket.on('hook-accept', (hookId, error) => {
    hub.HookManager.finalize(hookId, socket.connector.id).then(() => {
      error(null);
    }).catch((err) => {
      console.log(err);
      error("Could not finalize hook.");
    });
  });
};
