'use strict';
const express = require('express');
let router = express.Router();
let dashboardRouter = require('./dashboard/router');
let skillRouter = require('./logic/skill_splitter');

// Main middleware
router.use((req, res, next) => {
  next();
});

// Bot Brain main endpoit
router.get('/', (req, res) => {
  res.json({ success: true, message: 'Entry of Bot Brain Interface API. /dashboard for admin interface, /nlp for a natural language conversation post, /command for a command post.' });
});

// NLP conversation entry point.
router.post('/nlp', (req, res) => {
  let phrase = req.body.phrase || req.query.phrase;
  if (!phrase) {
    return res.json({ success: false, message: 'No phrase string to analyze in body.'})
  }
  skillRouter.startSkill('nlp', phrase).then((response) => {
    if (!response.analyzed.intent) {
      return res.json({ success: response.success, message: `It seems I have no skill that could fit your request, maybe it was disabled, I'm sorry :/`, source: req.body.phrase });
    }
    let entities = "\nHere are the entities I found:";
    for (let entity in response.analyzed.entities) {
      entities += `\n*${entity}* for raw "_${response.analyzed.entities[entity][0].raw}_"`
    }
    skillRouter.startSkill(response.analyzed.intent, "").then((response) => {
      return res.json({ success: response.success, message: response.message, source: req.body.phrase });
    }).catch((error) => {
      console.log(error.stack)
      return res.json({ success: true, message: 'Unkown error with nlp endpoint.', source: req.body.phrase });
    })
  }).catch((error) => {
    console.log(error.stack);
    return res.json({ success: true, message: 'Unkown error with nlp endpoint.', source: req.body.phrase });
  })
})

// Command handling entry point.
router.post('/command', (req, res) => {
  let command = req.body.command || req.query.command;
  if (!command) {
    return res.json({ success: false, message: 'No command string to parse in body.'})
  }
  return res.status(501).json({ success: false, message: 'Entry of Bot Brain Interface API. /dashboard for admin interface, /nlp for a natural language conversation post, /command for a command post.', source: req.body.command });
})

// Routing dashboard requests
router.use('/dashboard', dashboardRouter);

// 404 Error
router.get('*', (req, res) => {
  res.status(404).json({ success: false, status: 404, message: 'Endpoint not found.' });
});

// Error handling (logging)
router.use((err, req, res, next) => {
  console.log(err.stack)
  res.status(500).json({ success: false, status: 500, message: 'Internal Server Error.' });
});


module.exports = router;
