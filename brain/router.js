'use strict';
const express = require('express');
let router = express.Router();
let dashboardRouter = require('./dashboard/router');


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
  res.status(501).json({ success: false, message: 'Phrase analyzed (not implemented).', source: req.body.phrase });
})

// Command handling entry point.
router.post('/command', (req, res) => {
  let command = req.body.command || req.query.command;
  if (!command) {
    return res.json({ success: false, message: 'No command string to parse in body.'})
  }
  res.status(501).json({ success: false, message: 'Entry of Bot Brain Interface API. /dashboard for admin interface, /nlp for a natural language conversation post, /command for a command post.', source: req.body.command });
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
