'use strict';
const express = require('express');
let router = express.Router();
let dashboardRouter = require('./dashboard/router');
let hub = require('./logic/hub');

// Main middleware
router.use((req, res, next) => {
  next();
});

///////////////////////////////////////////////////////////////////////////////
//                      UNSECURED ENDPOINTS
///////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////

// Bot Brain main endpoint
router.get('/', (req, res) => {
  res.json({ success: true, message: 'Entry of Bot Brain Interface API. /dashboard for admin interface, /nlp for a natural language conversation post, /command for a command post.' });
});

///////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////
// DASHBOARD ENDPOINTS

// Routing dashboard requests
router.use('/dashboard', dashboardRouter);

///////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////
//                      AUTHED ENDPOINTS
///////////////////////////////////////////////////////////////////////////////

// MIDDLEWARE FOR AUTH
/**
  Check token of user.
*/
router.use(function (req, res, next) {
  next();
});

///////////////////////////////////////////////////////////////////////////////
// BOT ENDPOINTS

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

///////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////
// BOT ADMIN ENDPOINTS

// list skills
/**
 * @api {get} /skills List skills avaible.
 * @apiName ListSkills
 * @apiGroup Skills
 *
 * @apiSuccess {Boolean} success Success of operation.
 * @apiSuccess {String} message Message from api.
 * @apiSuccess {Skill} skills List of available skills.
 */
router.get('/skills', (req, res) => {
  // TODO: Deport to hub in function.
  let skills = hub.skills.skills;

  // Be sure to send handle and execute names instead of function object
  for (let skill in skills) {
    for (let intentName in skills[skill].intents) {
      skills[skill].intents[intentName].handle = `${skills[skill].intents[intentName].handle.name}`;
    }
    for (let commandName in skills[skill].commands) {
      skills[skill].commands[commandName].execute = `${skills[skill].commands[commandName].execute.name}`;
    }
  }
  return res.json({ success: true, message: 'Got list of bot skills.', skills: skills });
})

// Add a new skill
/**
 * @api {put} /skills Add a new skill.
 * @apiName AddSkill
 * @apiGroup Skills
 *
 * @apiParam {String} skill_name Name of the new skill.
 * @apiParam {String} skill_code Code of the new skill.
 *
 * @apiSuccess {Boolean} success Success of operation.
 * @apiSuccess {String} message Message from api.
 */
router.put('/skills', (req, res) => {
  if (!req.body.skill_name) {
    return res.json({ success: false, message: "Missing 'skill_name' definition in body." });
  }
  if (!req.body.skill_code) {
    return res.json({ success: false, message: "Missing 'skill_code' definition in body." });
  }
  let skill = { name: req.body.skill_name, code: req.body.skill_code };
  if (req.body.skill_secret) {
    skill.secret = req.body.skill_secret;
  }

  hub.addSkill(skill).then(() => {
    hub.loadSkill(skill.name).then(() => {
      return res.json({ success: true, message: "Skill added and loaded." });
    }).catch((err) => {
      return res.json({ success: true, message: "Skill added but not loaded (an error occured)." });
    });
  }).catch((err) => {
    if (err.message) {
      return res.json({ success: false, message: err.message });
    } else {
      console.log(err.stack);
      return res.json({ success: false, message: "An unkown error occured while saving new skill." });
    }
  });
});

// Reload skills.
/**
 * @api {post} /skills/:skill/reload Reload the skill.
 * @apiName ReloadSkill
 * @apiGroup Skills
 *
 * @apiParam {String} skill The name of the skill to reload.
 *
 * @apiSuccess {Boolean} success Success of operation.
 * @apiSuccess {String} message Message from api.
 */
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
/**
 * @api {get} /skills/:skill/reload Get the code of the skill.
 * @apiName GetSkillCode
 * @apiGroup Skills
 *
 * @apiParam {String} skill The name of the skill to get code of.
 *
 * @apiSuccess {Boolean} success Success of operation.
 * @apiSuccess {String} message Message from api.
 * @apiSuccess {String} code Code of the skill.
 */
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
/**
 * @api {put} /skills/:skill/reload Update the skill.
 * @apiName UpdateSkill
 * @apiGroup Skills
 *
 * @apiParam {String} skill The name of the skill to update.
 * @apiParam {String} code The new code of the skill.
 *
 * @apiSuccess {Boolean} success Success of operation.
 * @apiSuccess {String} message Message from api.
 */
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
/**
 * @api {post} /skills/:skill/:status Activate/Deactive a skill.
 * @apiName StatusSkill
 * @apiGroup Skills
 *
 * @apiParam {String} skill The name of the skill to update.
 * @apiParam {String} status "on" or "off".
 *
 * @apiSuccess {Boolean} success Success of operation.
 * @apiSuccess {String} message Message from api.
 * @apiSuccess {Boolean} active true if the skill is active, false otherwise.
 */
router.post('/skills/:skill/:status', (req, res) => {
  // TODO: move activation/deactivation in a function exposed by hub!
  if (hub.skills.has(req.params.skill)) {
    if (req.params.status === "on") {
      hub.activateSkill(req.params.skill).then(() => {
        return res.json({ success: true, message: `Skill ${req.params.skill} activated.`, active: true });
      }).catch((err) => {
        return res.json({ success: false, message: "Could not activate skill." });
      });
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

///////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////
// ERRORS

// 404 Error
router.get('*', (req, res) => {
  res.status(404).json({ success: false, status: 404, message: 'Endpoint not found.' });
});

// Error handling (logging)
router.use((err, req, res, next) => {
  console.log(err.stack)
  res.status(500).json({ success: false, status: 500, message: 'Internal Server Error.' });
});

///////////////////////////////////////////////////////////////////////////////

module.exports = router;
