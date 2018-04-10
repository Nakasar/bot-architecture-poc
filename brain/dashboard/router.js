'use strict';
const express = require('express');
const hub = require('../logic/hub');
const path = require('path');
const jwt = require('jsonwebtoken');
const config = require('../secret');
const users = require('../database/controllers/userController');
let router = express.Router();

// Dashboard middleware
router.use((req, res, next) => {
  next();
});

/**
 * @api {get} /dashboard/setup Setup admin account.
 * @apiName SetupAdmin
 * @apiGroup Setup
 *
 * @apiSuccess {Boolean} success Success of operation.
 * @apiSuccess {String} message Message from api.
 */
router.get('/setup', (err, res) => {
  users.create_user({ user_name: "Nakasar", password: "Password0" }).then((obj) => {
    return res.json({ success: true, message: "Admin user added.", user: obj.user });
  }).catch((err) => {
    return res.json({ success: false, message: "Could not setup admin user." });
  });
});

router.use('/static', express.static(path.join(__dirname, './public')));

// Login Page
router.get('/login', (req, res) => {
  return res.render('login');
})

// Login endpoint
/**
 * @api {post} /dashboard/login Login to dashboard
 * @apiName DashboardLogin
 * @apiGroup Dashboard
 *
 * @apiSuccess {Boolean} success Success of operation.
 * @apiSuccess {String} message Message from api.
 * @apiSuccess {String} token User token for this session.
 */
router.post('/login', (req, res) => {
  users.sign_in(req.body.user_name, req.body.password).then((obj) => {
    return res.json({ success: true, message: obj.message, token: obj.token });
  }).catch((err) => {
    if (err.message) {
      return res.json({ success: false, message: err.message });
    }
    console.log(err.stack);
    return res.json({ success: false, message: "Unkown error." });
  });
});

// MIDDLEWARE FOR DASHBOARD AUTH
router.use(function(req, res, next) {
  let token = req.body.token || req.query.token || req.get("x-access-token") || req.cookies['user_token'];

  if (!token) {
    return res.redirect('/dashboard/login');
  }

  // Checking user token.
  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.redirect('/dashboard/login');
    }
    next();
  });
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

// Dashboard Skills administration
router.get('/skills/new', (req, res) => {
  res.render('skill_edit', {
    title: 'Add Skill - Bot',
    nav_link: 'nav-skills'
  });
});

// Dashboard Skills administration
router.get('/skills/:skill/edit', (req, res) => {
  let skill = hub.skills.get(req.params.skill);
  if (skill) {
    hub.getSkillCode(req.params.skill).then((code) => {
      res.render('skill_edit', {
        title: 'Edit Skill ' + req.params.skill + ' - Bot',
        nav_link: 'nav-skills',
        skill_edited: {
          name: req.params.skill,
          code: code,
          intents: skill.intents.intents,
          commands: skill.commands.commands,
          dependencies: skill.dependencies,
          active: skill.active
        }
      });
    }).catch((err) => {
      res.redirect('/dashboard/skills');
    });
  } else {
    res.redirect('/dashboard/skills');
  }
});

router.get('/connectors', (req, res) => {
  hub.ConnectorManager.getConnectors()
    .then((connectors) => res.render('connectors', {
        title: 'Manage Connectors',
        nav_link: 'nav-connectors',
        connectors
      }))
    .catch((err) => res.status(500).json({ error: 500, message: 'Internal server error while retrieving connectors list.' }));
});

// Dashboard 404 Error
router.get('*', (req, res) => {
  res.status(404).render('error', { code: 404, message: "404 Error : Page Not Found. "});
});

// Dashboard error handling (logging)
router.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(500).send(`<h1 style="color: brown;">500 - INTERAL SERVER ERROR</h1><p>Something broke on our side. We're sorry not being able to fullfill your request :/</p>`)
});

module.exports = router;
