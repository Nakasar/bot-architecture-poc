'use strict';
const express = require('express');
let router = express.Router();
let dashboardRouter = require('./dashboard/router');
let hub = require('./logic/hub');

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
  hub.handleCommand('analyze', phrase).then((response) => {
    if (!response.response.intent) {
      return res.json({ success: response.success, message: `It seems I have no skill that could fit your request, maybe it was disabled, I'm sorry :/`, source: req.body.phrase });
    }

    hub.handleIntent(response.response.intent, response.response.entities).then((response) => {
      return res.json({ success: response.success, message: response.message, source: req.body.phrase });
    }).catch((error) => {
      console.log(error.stack)
      return res.json({ success: false, message: 'Unkown error with nlp endpoint.', source: req.body.phrase });
    })
  }).catch((error) => {
    console.log(error.stack);
    return res.json({ success: false, message: 'Unkown error with nlp endpoint.', source: req.body.phrase });
  })
})

// Command handling entry point.
router.post('/command', (req, res) => {
  let phrase = req.body.command || req.query.command;
  if (!phrase) {
    return res.json({ success: false, message: 'No command string to parse in body.'});
  }

  let [command, ...params] = phrase.split(" ");

  hub.handleCommand(command, params.join(" ")).then((response) => {
    return res.json({ success: response.success, message: response.message, source: command });
  }).catch((error) => {
    console.log(error.stack);
    return res.json({ success: false, message: 'Unkown error while handling command.', source: commad });
  });
});

// list skills
router.get('/skills', (req, res) => {
  let skills = hub.skills.skills;
  return res.json({ success: true, message: 'Got list of bot skills.', skills: skills });
})

// Reload skills.
router.post('/skills/:skill/reload', (req, res) => {
  // TODO: move activation/deactivation in a function exposed by hub!
  if (hub.skills.has(req.params.skill)) {
    hub.reloadSkill(req.params.skill).then(() => {
      return res.json({ success: true, message: `Skill ${req.params.skill} reloaded.`})
    }).catch(() => {
      return res.json({ success: false, message: `Could not reload Skill ${req.params.skill}.`})
    });
  } else {
    return res.json({ success: false, message: `Skill ${req.params.skill} does not exists.`});
  }
});

// Get skill code
router.get('/skills/:skill/edit', (req, res) => {
  // TODO: move activation/deactivation in a function exposed by hub!
  if (hub.skills.has(req.params.skill)) {
    hub.getSkillCode(req.params.skill).then((code) => {
      return res.json({ success: true, message: `Code of Skill ${req.params.skill} retrieved.`, code: code })
    }).catch(() => {
      return res.json({ success: false, message: `Could not get code of Skill ${req.params.skill}.`})
    });
  } else {
    return res.json({ success: false, message: `Skill ${req.params.skill} does not exists.`});
  }
});

// Update skill code
router.put('/skills/:skill/edit', (req, res) => {
  // TODO: move activation/deactivation in a function exposed by hub!
  if (hub.skills.has(req.params.skill)) {
    hub.saveSkillCode(req.params.skill, req.body.code).then(() => {
      return res.json({ success: true, message: `Code of Skill ${req.params.skill} saved, skill reloaded successfully.` })
    }).catch(() => {
      return res.json({ success: false, message: `Could not save code of Skill ${req.params.skill}.`})
    });
  } else {
    return res.json({ success: false, message: `Skill ${req.params.skill} does not exists.`});
  }
});

// Activate/Deactivate skills.
router.post('/skills/:skill/:status', (req, res) => {
  // TODO: move activation/deactivation in a function exposed by hub!
  if (hub.skills.has(req.params.skill)) {
    if (req.params.status === "on") {
      hub.activateSkill(req.params.skill);
      return res.json({ success: true, message: `Skill ${req.params.skill} activated.`, active: true });
    } else if (req.params.status === "off") {
      hub.deactivateSkill(req.params.skill);
      return res.json({ success: true, message: `Skill ${req.params.skill} deactivated.`, active: false });
    } else {
      return res.json({ success: false, message: `Wrong status code : on or off.`});
    }
  } else {
    return res.json({ success: false, message: `Skill ${req.params.skill} does not exists.`});
  }
});

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
