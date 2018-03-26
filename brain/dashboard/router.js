'use strict';
const express = require('express');
const hub = require('../logic/hub');
let router = express.Router();

// Dashboard middleware
router.use((req, res, next) => {
  next();
});

// Dashboard index
router.get('/', (req, res) => {
  res.render('index', {
    title: 'Dashboard - Bot',
    nav_link: 'nav-portal',
    message: 'Welcome to administration panel of this amazing Bot.',
    mainTitle: "Bot Brain Dashboard",
    skills: hub.skills.skills
  });
});

// Dashboard Skills administration
router.get('/skills', (req, res) => {
  res.render('skills', {
    title: 'Skills - Bot',
    nav_link: 'nav-skills',
    message: 'Welcome to administration panel of this amazing Bot.',
    mainTitle: "Bot Brain Dashboard",
    skills: hub.skills.skills
  });
});

// Activate/Deactivate skills.
router.post('/skills/:skill/:status', (req, res) => {
  // TODO: move activation/deactivation in a function exposed by hub!
  if (hub.skills.has(req.params.skill)) {
    if (req.params.status === "on") {
      hub.activateSkill(req.params.skill);
      return res.json({ success: true, message: `Skill ${req.params.skill} activated.`});
    } else if (req.params.status === "off") {
      hub.deactivateSkill(req.params.skill);
      return res.json({ success: true, message: `Skill ${req.params.skill} deactivated.`});
    }
  } else {
    return res.json({ success: false, message: `Skill ${req.params.skill} does not exists.`});
  }
})

// Dashboard 404 Error
router.get('*', (req, res) => {
  res.status(404).send(`<h1 style="color: brown;">404</h1><p>Page not found :'(</p>`);
});

// Dashboard error handling (logging)
router.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(500).send(`<h1 style="color: brown;">500 - INTERAL SERVER ERROR</h1><p>Something broke on our side. We're sorry not being able to fullfill your request :/</p>`)
});

module.exports = router;
