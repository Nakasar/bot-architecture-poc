'use strict';
const express = require('express');
const hub = require('../logic/hub');
const path = require('path');
const jwt = require('jsonwebtoken');
const config = require('../secret');
const users = require('../database/controllers/userController');

module.exports = function(io) {
  let router = express.Router();

  // Dashboard Main Middleware
  router.use((req, res, next) => {
    next();
  });

  ///////////////////////////////////////////////////////////////////////////////
  //                      UNSECURED ENDPOINTS
  ///////////////////////////////////////////////////////////////////////////////

  ///////////////////////////////////////////////////////////////////////////////
  // Setup for admin account. Will be ignored if there is at least one user in the database.

  /**
   * @api {get} /dashboard/setup Setup admin account.
   * @apiName SetupAdmin
   * @apiGroup Setup
   *
   * @apiSuccess {Boolean} success Success of operation.
   * @apiSuccess {String} message Message from api.
   */
  router.get('/setup', (err, res) => {
    users.is_empty().then((isempty) => {
      if (isempty) {
        users.create_user({ user_name: "Nakasar", password: "Password0", admin: true }).then((obj) => {
          users.promote_user(obj.user.id, true).then((user) => {
            return res.json({ success: true, message: "Admin user added.", user: obj.user });
          }).catch((err) => {
            console.log(err);
            return res.status(500).json({ success: false, message: "Could not setup admin user." });
          });
        }).catch((err) => {
          console.log(err);
          return res.status(500).json({ success: false, message: "Could not setup admin user." });
        });
      } else {
        return res.status(403).json({ success: false, message: "The user database is not empty." });
      }
    }).catch((err) => {
      console.log(err);
      return res.status(500).json({ success: false, message: "Could not setup admin user." });
    });
  });

  //
  ///////////////////////////////////////////////////////////////////////////////

  router.use('/static', express.static(path.join(__dirname, './public')));

  // Login Page
  router.get('/login', (req, res) => {
    return res.render('login');
  });

  ///////////////////////////////////////////////////////////////////////////////
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

  //
  ///////////////////////////////////////////////////////////////////////////////

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
      req.decoded = decoded;
      next();
    });
  });

  ///////////////////////////////////////////////////////////////////////////////
  //                      AUTHED ENDPOINTS
  ///////////////////////////////////////////////////////////////////////////////

  ///////////////////////////////////////////////////////////////////////////////
  // Dashboard index

  router.get('/', (req, res, next) => {
    hub.ConnectorManager.getConnectorByName("Dashboard").then((connector) => {
      hub.getSkills().then((skills) => {
        res.render('index', {
          title: 'Dashboard - Bot',
          nav_link: 'nav-portal',
          message: 'Welcome to administration panel of this amazing Bot.',
          mainTitle: "Bot Brain Dashboard",
          skills: skills,
          connector_token: connector.token
        });
      }).catch((err) => {
        return next(err);
      });
    }).catch((err) => {
      hub.getSkills().then((skills) => {
        res.render('index', {
          title: 'Dashboard - Bot',
          nav_link: 'nav-portal',
          message: 'Welcome to administration panel of this amazing Bot.',
          mainTitle: "Bot Brain Dashboard",
          skills: skills,
          connector_token: ""
        });
      }).catch((err) => {
        return next(err);
      });
    })
  });
  //
  ///////////////////////////////////////////////////////////////////////////////

  ///////////////////////////////////////////////////////////////////////////////
  // Dashboard Skills administration

  router.get('/skills', (req, res) => {
    hub.getSkills().then((skills) => {
      res.render('skills', {
        title: 'Skills - Bot',
        nav_link: 'nav-skills',
        message: 'Welcome to administration panel of this amazing Bot.',
        mainTitle: "Bot Brain Dashboard",
        skills: skills
      });
    });
  });

  //
  ///////////////////////////////////////////////////////////////////////////////

  ///////////////////////////////////////////////////////////////////////////////
  // Dashboard Skills administration

  router.get('/skills/new', (req, res) => {
    res.render('skill_edit', {
      title: 'Add Skill - Bot',
      nav_link: 'nav-skills'
    });
  });

  //
  ///////////////////////////////////////////////////////////////////////////////

  ///////////////////////////////////////////////////////////////////////////////
  // Skill Monitoring

  router.get('/skills/:skill', (req, res, next) => {
    hub.getSkill(req.params.skill).then((skillFound) => {
      if (skillFound) {
        let skill = Object.assign({}, skillFound);
        skill.name = req.params.skill;

        Promise.all([hub.HookManager.getForSkill(req.params.skill), hub.StorageManager.getForSkill(req.params.skill)]).then(([ hooks, storage ]) => {
          skill.hooks = hooks;
          skill.storage = storage;

          res.render('skill', {
            title: skill.name,
            nav_link: 'nav-skills',
            skill
          });
        }).catch((err) => {
          console.log(err);
          return next({ code: 500 });
        });
      } else {
        res.render('skill', {
          title: 'Skill not found',
          nav_link: 'nav-skills'
        });
      }
    }).catch((err) => {
      next(err);
    });
  });

  //
  ///////////////////////////////////////////////////////////////////////////////

  ///////////////////////////////////////////////////////////////////////////////
  // Dashboard Skills administration

  router.get('/skills/:skill/edit', (req, res) => {
    hub.getSkill(req.params.skill).then((skill) => {
      if (skill) {
        hub.getSkillCode(req.params.skill).then((code) => {
          res.render('skill_edit', {
            title: 'Edit Skill ' + req.params.skill + ' - Bot',
            nav_link: 'nav-skills',
            skill_edited: {
              name: req.params.skill,
              code: code,
              intents: skill.intents ? skill.intents.intents : [],
              commands: skill.commands ? skill.commands.commands : [],
              dependencies: skill.dependencies ? skill.dependencies : [],
              active: skill.active
            }
          });
        }).catch((err) => {
          console.log(err);
          res.redirect('/dashboard/skills');
        });
      } else {
        res.redirect('/dashboard/skills');
      }
    });
  });

  //
  ///////////////////////////////////////////////////////////////////////////////

  ///////////////////////////////////////////////////////////////////////////////
  // Connectors administration

  router.get('/connectors', (req, res, next) => {
    hub.ConnectorManager.getConnectors()
      .then((connectors) => {
        res.render('connectors', {
          title: 'Manage Connectors',
          nav_link: 'nav-connectors',
          connectors
        })
      })
      .catch((err) => {
        return next(err);
      });
  });

  //
  ///////////////////////////////////////////////////////////////////////////////

  ///////////////////////////////////////////////////////////////////////////////
  // User account settings

  router.get('/settings', (req, res, next) => {
    users.get_user(req.decoded.user.id).then((user) => {
      return res.render('settings', {
        title: "Dashboard Settings - Bot",
        nav_link: 'settings',
        user: user
      });
    }).catch((err) => {
      return next();
    })
  });

  //
  ///////////////////////////////////////////////////////////////////////////////

  ///////////////////////////////////////////////////////////////////////////////
  // Modify username

  router.put('/settings/username', (req, res) => {
    let usernameRegex = /^[0-9a-zA-Z\u00E0-\u00FC -_]{3,30}$/;
    if (req.body.username && usernameRegex.test(req.body.username)) {
      users.update_username(req.decoded.user.id, req.body.username).then(() => {
        return res.status(200).json({ success: true, message: "Username updated." });
      }).catch((err) => {
        if (err.error) {
          return res.status(400).json({ success: false, message: "Username already in use." });
        } else {
          return res.status(500).json({ success: false, message: "Error while setting username." });
        }
      });
    } else {
      return res.status(400).json({ success: false, message: "Username must contains only letters (accentued), digits, '-', '_', and whitespaces, from 3 to 30 characters." });
    }
  });

  //
  ///////////////////////////////////////////////////////////////////////////////

  ///////////////////////////////////////////////////////////////////////////////
  // Modify password

  router.put('/settings/password', (req, res) => {
    if (!req.body.current_password) {
      return res.status(400).json({ sucess: false, message: "No current password to confirm security operation." });
    }

    let passwordRegex = /^[0-9a-zA-Z\u00E0-\u00FC!@#{}~"'\(\[|\\^=+\]\)-_]{8,30}$/; // eslint-disable-line no-useless-escape
    if (req.body.new_password && passwordRegex.test(req.body.new_password)) {
      users.update_password(req.decoded.user.id, req.body.current_password, req.body.new_password).then(() => {
        return res.status(200).json({ success: true, message: "Password updated." });
      }).catch((err) => {
        if (err.error) {
          return res.status(400).json({ success: false, message: err.message });
        } else {
          return res.status(500).json({ success: false, message: "Error while setting password." });
        }
      });
    } else {
      return res.status(400).json({ success: false, message: "new_password must contains only letters, digits, some special characters, from 8 to 30 characters." });
    }
  });
  
  //
  ///////////////////////////////////////////////////////////////////////////////

  // Dashboard 404 Error
  router.get('*', (req, res) => {
    res.status(404).render('error', { code: 404, message: "404 Error : Page Not Found." });
  });

  // Dashboard error handling (logging)
  router.use((err, req, res, next) => {
    console.log(err);
    res.status(500).render('error', { code: 500, message: "500 Error: Internal Server Error." })
  });

  return router;
};
