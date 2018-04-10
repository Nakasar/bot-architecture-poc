'use strict';
const express = require('express');
let router = express.Router();
let hub = require('./logic/hub');

// Bot endpoints middleware
function checkConnectorToken(req, res, next) {
  // Checking connector token.
  let token = req.body.token || req.query.token || req.get("x-access-token");

  if (!token) {
    return res.status(403).json({ success: false, error: 403, message: "No token found to authentificate connector."});
  }

  hub.checkConnectorToken(token)
    .then((connector) => {
      if (connector && connector.active) {
        req.connector_id = connector._id;
        next();
      } else {
        return res.status(403).json({ success: false, error: 403, message: "Invalid token found to authentificate connector."});
      }
    })
    .catch((err) => {
      return res.status(500).json({ success: false, error: 501, message: "Internal server error while checking token."});
    });
};

// NLP conversation entry point.
/**
 * @api {post} /nlp NLP bot entry point.
 * @apiName NLP
 * @apiGroup Bot
 *
 * @apiParam {String} phrase Text phrase to analyze and execute.
 *
 * @apiSuccess {Boolean} success Success of operation.
 * @apiSuccess {String} message Message from api.
 * @apiSuccess {String} source Source given to the NLP.
 */
router.post('/nlp', checkConnectorToken, (req, res) => {
  let phrase = req.body.phrase || req.query.phrase;
  if (!phrase) {
    return res.json({ success: false, message: { text: 'No phrase string to analyze in body.' }})
  }
  hub.handleCommand('analyze', phrase).then((response) => {
    if (!response.response.intent) {
      return res.json({ success: response.success, message: { text: `It seems I have no skill that could fit your request, maybe it was disabled, I'm sorry :/` }, source: req.body.phrase });
    }

    hub.handleIntent(response.response.intent, response.response.entities).then((response) => {
      return res.json({ success: response.success, message: response.message, source: req.body.phrase });
    }).catch((error) => {
      console.log(error.stack)
      return res.json({ success: false, message: { text: 'Unkown error with nlp endpoint.' }, source: req.body.phrase });
    })
  }).catch((error) => {
    console.log(error.stack);
    return res.json({ success: false, message: { text: 'Unkown error with nlp endpoint.' }, source: req.body.phrase });
  })
})

// Command handling entry point.
/**
 * @api {post} /command Command bot entry point.
 * @apiName Command
 * @apiGroup Bot
 *
 * @apiParam {String} command Command phrase to execute (without prefix).
 *
 * @apiSuccess {Boolean} success Success of operation.
 * @apiSuccess {String} message Message from api.
 * @apiSuccess {String} source Source given to the Command handler.
 */
router.post('/command', checkConnectorToken, (req, res) => {
  let phrase = req.body.command || req.query.command;
  if (!phrase) {
    return res.json({ success: false, message: { text: 'No command string to parse in body.' }});
  }

  let [command, ...params] = phrase.split(" ");

  hub.handleCommand(command, params.join(" ")).then((response) => {
    return res.json({ success: response.success, message: response.message, source: command });
  }).catch((error) => {
    console.log(error.stack);
    return res.json({ success: false, message: { text: 'Unkown error while handling command.' }, source: command });
  });
});

// Interactive conversation entry point.
/**
 * @api {post} /converse Interactive conversation bot entry point.
 * @apiName converse
 * @apiGroup Bot
 *
 * @apiParam {String} phrase Phrase answered to bot.
 * @apiParam {String} thread_id Thread id answered to.
 *
 * @apiSuccess {Boolean} success Success of operation.
 * @apiSuccess {String} message Message from api.
 * @apiSuccess {String} source Source given to the Converse handler.
 */
router.post('/converse', checkConnectorToken, (req, res) => {
  let phrase = req.body.phrase || req.query.phrase;
  let threadId = req.body.thread_id || req.query.thread_id;
  if (!phrase) {
    return res.json({ success: false, message: { text: 'No answer in body/query.' }});
  }

  if (!threadId) {
    return res.json({ success: false, message: { text: 'No thread_id in body/query.' }});
  }

  hub.ThreadManager.handleThread(threadId, phrase).then((response) => {
    return res.json({ success: true, message: response.message, source: phrase, thread_id: threadId });
  }).catch((error) => {
    return res.json({ success: false, message: { text: 'Unkown error while handling conversation in thread.' }, source: phrase, thread_id: threadId });
  });
});

module.exports = router;
