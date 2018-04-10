define({ "api": [
  {
    "type": "post",
    "url": "/command",
    "title": "Command bot entry point.",
    "name": "Command",
    "group": "Bot",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "command",
            "description": "<p>Command phrase to execute (without prefix).</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>Success of operation.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Message from api.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "source",
            "description": "<p>Source given to the Command handler.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./botRouter.js",
    "groupTitle": "Bot"
  },
  {
    "type": "post",
    "url": "/nlp",
    "title": "NLP bot entry point.",
    "name": "NLP",
    "group": "Bot",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "phrase",
            "description": "<p>Text phrase to analyze and execute.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>Success of operation.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Message from api.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "source",
            "description": "<p>Source given to the NLP.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./botRouter.js",
    "groupTitle": "Bot"
  },
  {
    "type": "post",
    "url": "/converse",
    "title": "Interactive conversation bot entry point.",
    "name": "converse",
    "group": "Bot",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "phrase",
            "description": "<p>Phrase answered to bot.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "thread_id",
            "description": "<p>Thread id answered to.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>Success of operation.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Message from api.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "source",
            "description": "<p>Source given to the Converse handler.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./botRouter.js",
    "groupTitle": "Bot"
  },
  {
    "type": "post",
    "url": "/reload",
    "title": "Reload brain.",
    "name": "ReloadBrain",
    "group": "Brain",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>Success of operation.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Message from api.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./router.js",
    "groupTitle": "Brain"
  },
  {
    "type": "get",
    "url": "/connectors/:id",
    "title": "Get details about the specified connector.",
    "name": "DetailConnectors",
    "group": "Connectors",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>Success of operation.</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "connector",
            "description": "<p>The connector object.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "connector._id",
            "description": "<ul> <li>The unique id of a connector.</li> </ul>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "connector.name",
            "description": "<ul> <li>The name of a connector.</li> </ul>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "connector.active",
            "description": "<ul> <li>The status of a connector.</li> </ul>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "connector.token",
            "description": "<ul> <li>The auth token of a connector.</li> </ul>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./router.js",
    "groupTitle": "Connectors"
  },
  {
    "type": "get",
    "url": "/connectors",
    "title": "Get list of connectors registered for this bot, and their status.",
    "name": "ListConnectors",
    "group": "Connectors",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>Success of operation.</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": true,
            "field": "connectors",
            "description": "<p>List of connectors registered.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": true,
            "field": "connectors[]",
            "description": "<p>._id] - The unique id of a connector.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./router.js",
    "groupTitle": "Connectors"
  },
  {
    "type": "post",
    "url": "/connectors/:id/token",
    "title": "Regenerate token for the specified connector.",
    "name": "RefreshConnectorToken",
    "group": "Connectors",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>Success of operation.</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "connector",
            "description": "<p>The connector object.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "connector._id",
            "description": "<ul> <li>The unique id of a connector.</li> </ul>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "connector.name",
            "description": "<ul> <li>The name of a connector.</li> </ul>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "connector.active",
            "description": "<ul> <li>The status of a connector.</li> </ul>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "connector.token",
            "description": "<ul> <li>The new auth token of a connector.</li> </ul>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./router.js",
    "groupTitle": "Connectors"
  },
  {
    "type": "post",
    "url": "/dashboard/login",
    "title": "Login to dashboard",
    "name": "DashboardLogin",
    "group": "Dashboard",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>Success of operation.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Message from api.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "token",
            "description": "<p>User token for this session.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./dashboard/router.js",
    "groupTitle": "Dashboard"
  },
  {
    "type": "get",
    "url": "/dashboard/setup",
    "title": "Setup admin account.",
    "name": "SetupAdmin",
    "group": "Setup",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>Success of operation.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Message from api.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./dashboard/router.js",
    "groupTitle": "Setup"
  },
  {
    "type": "put",
    "url": "/skills",
    "title": "Add a new skill.",
    "name": "AddSkill",
    "group": "Skills",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "skill_name",
            "description": "<p>Name of the new skill.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "skill_code",
            "description": "<p>Code of the new skill.</p>"
          },
          {
            "group": "Parameter",
            "type": "Object",
            "optional": true,
            "field": "skill_secret",
            "description": "<ul> <li>Secrets for this skill.</li> </ul>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "skill_secret[]",
            "description": "<p>.key] - The key of a secret.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>Success of operation.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Message from api.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./router.js",
    "groupTitle": "Skills"
  },
  {
    "type": "delete",
    "url": "/skills/:skill",
    "title": "Delete a skill.",
    "name": "DeleteSkill",
    "group": "Skills",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "skill",
            "description": "<p>Name of the skill to delete.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>Success of operation.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Message from api.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./router.js",
    "groupTitle": "Skills"
  },
  {
    "type": "get",
    "url": "/skills/:skill/reload",
    "title": "Get the code of the skill.",
    "name": "GetSkillCode",
    "group": "Skills",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "skill",
            "description": "<p>The name of the skill to get code of.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>Success of operation.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Message from api.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "code",
            "description": "<p>Code of the skill.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./router.js",
    "groupTitle": "Skills"
  },
  {
    "type": "get",
    "url": "/skills",
    "title": "List skills avaible.",
    "name": "ListSkills",
    "group": "Skills",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>Success of operation.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Message from api.</p>"
          },
          {
            "group": "Success 200",
            "type": "Skill",
            "optional": false,
            "field": "skills",
            "description": "<p>List of available skills.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./router.js",
    "groupTitle": "Skills"
  },
  {
    "type": "post",
    "url": "/skills/:skill/reload",
    "title": "Reload the skill.",
    "name": "ReloadSkill",
    "group": "Skills",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "skill",
            "description": "<p>The name of the skill to reload.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>Success of operation.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Message from api.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./router.js",
    "groupTitle": "Skills"
  },
  {
    "type": "post",
    "url": "/skills/:skill/:status",
    "title": "Activate/Deactive a skill.",
    "name": "StatusSkill",
    "group": "Skills",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "skill",
            "description": "<p>The name of the skill to update.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "status",
            "description": "<p>&quot;on&quot; or &quot;off&quot;.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>Success of operation.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Message from api.</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "active",
            "description": "<p>true if the skill is active, false otherwise.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./router.js",
    "groupTitle": "Skills"
  },
  {
    "type": "put",
    "url": "/skills/:skill/code",
    "title": "Update the skill.",
    "name": "UpdateSkill",
    "group": "Skills",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "skill",
            "description": "<p>The name of the skill to update.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "code",
            "description": "<p>The new code of the skill.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>Success of operation.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Message from api.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./router.js",
    "groupTitle": "Skills"
  },
  {
    "type": "put",
    "url": "/skills/:skill/secret",
    "title": "Update the skill.",
    "name": "UpdateSkill",
    "group": "Skills",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "skill",
            "description": "<p>The name of the skill to update.</p>"
          },
          {
            "group": "Parameter",
            "type": "Object",
            "optional": true,
            "field": "skill_secret",
            "description": "<ul> <li>Secrets for this skill.</li> </ul>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "skill_secret[]",
            "description": "<p>.key] - The key of a secret.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>Success of operation.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Message from api.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./router.js",
    "groupTitle": "Skills"
  }
] });
