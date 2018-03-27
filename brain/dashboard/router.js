'use strict';
const express = require('express');
const hub = require('../logic/hub');
const path = require('path');
let router = express.Router();

// Dashboard middleware
router.use((req, res, next) => {
  next();
});

router.use('/static', express.static(path.join(__dirname, './public')));

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
