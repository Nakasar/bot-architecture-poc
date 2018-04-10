'use strict';
const express = require('express');
let router = express.Router();
const botRouter = require('./botRouter');
const dashboardRouter = require('./dashboard/router');
let hub = require('./logic/hub');
const jwt = require('jsonwebtoken');
const config = require('./secret');

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

router.use(botRouter);

///////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////
// BOT ADMIN ENDPOINTS

// MIDDLEWARE FOR BOT ADMIN AUTH
router.use(function(req, res, next) {
  let token = req.body.token || req.query.token || req.get("x-access-token") || req.cookies['user_token'];

  if (!token) {
    return res.status(403).json({ success: false, message: "No token provided in body/query/header/cookies." });
  }

  // Checking user token.
  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, message: "Invalid authentification." });
    }

    next();
  });
});

// Reload brain
/**
 * @api {post} /reload Reload brain.
 * @apiName ReloadBrain
 * @apiGroup Brain
 *
 * @apiSuccess {Boolean} success Success of operation.
 * @apiSuccess {String} message Message from api.
 */
router.post('/reload', (req, res) => {
  hub.reloadBrain().then(() => {
    return res.json({ success: true, message: "Successfully reloaded brain." });
  }).catch((err) => {
    console.log(err.stack);
    return res.json({ success: false, message: "An unkown error occured while reloading brain." });
  });
}),

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
    for (let interactionName in skills[skill].interactions) {
      skills[skill].interactions[interactionName].interact = `${skills[skill].interactions[interactionName].interact.name}`;
    }
  }
  return res.json({ success: true, message: 'Got list of bot skills.', skills: skills });
});

// Add a new skill
/**
 * @api {put} /skills Add a new skill.
 * @apiName AddSkill
 * @apiGroup Skills
 *
 * @apiParam {String} skill_name Name of the new skill.
 * @apiParam {String} skill_code Code of the new skill.
 * @apiParam {Object} [skill_secret] - Secrets for this skill.
 * @apiParam {String} [skill_secret[].key] - The key of a secret.
 * @apiParam {String} [skill_secret[].value] - The value of a secret.
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

// Delete a skill
/**
 * @api {delete} /skills/:skill Delete a skill.
 * @apiName DeleteSkill
 * @apiGroup Skills
 *
 * @apiParam {String} skill Name of the skill to delete.
 *
 * @apiSuccess {Boolean} success Success of operation.
 * @apiSuccess {String} message Message from api.
 */
 router.delete('/skills/:skill', (req, res) => {
   hub.deleteSkill(req.params.skill).then(() => {
     return res.json({ success: true, message: "Successfully deleted skill." });
   }).catch((err) => {
     console.log(err.stack);
     return res.json({ success: false, message: "An unkown error occured while deleting skill." });
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
 * @api {put} /skills/:skill/code Update the skill.
 * @apiName UpdateSkill
 * @apiGroup Skills
 *
 * @apiParam {String} skill The name of the skill to update.
 * @apiParam {String} code The new code of the skill.
 *
 * @apiSuccess {Boolean} success Success of operation.
 * @apiSuccess {String} message Message from api.
 */
router.put('/skills/:skill/code', (req, res) => {
  if (!req.body.code) {
    return res.json({ success: false, message: "Missing 'code' definition in body." });
  }

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

// Update skill secrets
/**
 * @api {put} /skills/:skill/secret Update the skill.
 * @apiName UpdateSkill
 * @apiGroup Skills
 *
 * @apiParam {String} skill The name of the skill to update.
 * @apiParam {Object} [skill_secret] - Secrets for this skill.
 * @apiParam {String} [skill_secret[].key] - The key of a secret.
 * @apiParam {String} [skill_secret[].value] - The value of a secret.
 *
 * @apiSuccess {Boolean} success Success of operation.
 * @apiSuccess {String} message Message from api.
 */
router.put('/skills/:skill/secret', (req, res) => {
  return res.status(501).json({ success: false, message: `Not implemented.`});
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

router.get('/connectors', (req, res) => {
  hub.getConnectors()
    .then((connectors) => res.json({
        success: true,
        connectors
      }))
    .catch((err) => res.status(500).json({ error: 500, message: 'Internal server error while retrieving connectors list.' }));
});

router.get('/connectors/:id', (req, res) => {
  hub.getConnector(req.params.id)
    .then((connector) => res.json({ success: true, connector: connector }))
    .catch((err) => res.status(404).json({ error: 404, message: 'No connector with id '+req.params.id }));
});

// Regenerate connector token
/**
 *
*/
router.post('/connectors/:id/token', (req, res) => {
  hub.regenerateConnectorToken(req.params.id)
    .then((connector) => res.json({ success: true, connector: connector }))
    .catch((err) => res.status(error.code || 500).json({ error: error.code || 500, message: error.message || "Internat server error while refreshing connector token." }));
})

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
