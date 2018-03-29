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
    "filename": "./router.js",
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
    "filename": "./router.js",
    "groupTitle": "Bot"
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
    "url": "/skills/:skill/reload",
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
  }
] });
