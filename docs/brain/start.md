# Get Started

## Install the brain
> See the [Install](/brain/setup.md) section to setup the arachne's brain. We recommend the [docker install](/brain/setup.md#docker-install) method if you want to integrate Arachne with existing chat clients.

> You should use the [docker full install](/brain/setup.md#docker-full-install) if you want to test locally the framework with RocketChat. If you intend to contribute, you should develop using the [node classical install](/brain/setup.md#classical-installation).

## Plug in a NLP service.
> It is optionnal, yet it recommended to use a NLP service. You may use [RECAST.ai](https://recast.ai/), [WIT.ai](https://wit.ai/), or any other solutions (icluding your own !). Follow these steps to plug in a NLP service:

1. Log in the dashboard (base account should be `Nakasar` & `Password0`).
1. Navigate to the **Skills** tab and in the **nlp** Skill click the *edit skill* icon.
1. In the edition tab, click *Configure secret*.
1. In the openned modal, add a new secret named `recastai_token`, or whatever your NLP provider requires.
1. If you intend to use RECAST.ai, you are done. Go back to the **Skills* tab and activate the nlp Skill.
1. If not, you will have to edit the nlp skill code to send a http request to your NLP provider. The nlp skill must have an `analyze` command that returns a Promise to the following object:

```javascript
{
    intent: 'WEATHER',
    entities: {
        location: [
            "Kayl, LU"
        ],
        datetime: [
            "tomorrow"
        ]
    }
    message: 'I think your intent is intent-slug!'
}
```

## Authorize the Dashboard to test the bot
> All adapters, including the Dashboard, must by authorized by the brain and use their unique token.

1. Navigate to the **Connectors** tab.
1. Click **Add Connector**.
1. Enter `Dashboard` as the name of the connector, then click **Add**.

![Add Connector](/src/imgs/add_connector.png)
![Add 'Dashboard' Connector](/src/imgs/add_connector_dashboard.png)

## Test your NLP service
> Now that you have an active NLP service and that you authorized the bot, let's test your bot !

1. Navigate to the **Dashboard** tab.
1. In the chat sandbow, enter some message like "Hello!".
1. You should have an answer from the brain that is not an "error with nlp endpoint".

Correct:
![No error](/src/imgs/test_nlp.png)
Error:
![Error](/src/imgs/test_nlp_error.png)

## Create your first Skill
> Let's create a new skill from scratch !

1. Navigate to the **Skills** tab.
1. Click **New Skill*.
1. Give a name to your new skill, let's add a "jokes" skill that will query fun jokes from an external API.
1. As we will query an external API, select "API request" as the Skill's type.
1. Click **Generate template**.

![Add a new Skill](/src/imgs/new_skill.png)
![Generate Skill](/src/imgs/new_skill_generate.png)

6. Welcome to the Skill Edition Mode. Here, you can edit the code of your skill. (And must save it before configuring it.) You have to keep the template or your skill will not save.
1. As you may see, because you selected the "API Request" type, you already have the *request* library listed as a dependency. Let's require it. All you code will be in the `<SKILL LOGIC>` section:

```javascript

/* <SKILL LOGIC> */
const request = require('request');
/* </SKILL LOGIC> */
```

8. Our skill will have to respond the the `!joke` command. Click the **Add command** tool and give a name to the command, let's call it `say-a-joke`. The command will be what users will type, write `joke`. And we will give a nice name to our function, like `sayJoke`. Click **Add command**, and the editor will create a new template for you, and add the command declaration to the top of the file.

```javascript
/* <SKILL COMMANDS> */
let commands = {
  'say-a-joke': {
    cmd: "joke",
    execute: sayJoke
  }
};
/* </SKILL COMMANDS> */

/* <SKILL LOGIC> */
const request = require('request');

/**
  Handler for command say-a-joke (!joke).

  Params :
  --------
    phrase: String
*/
function sayJoke({ phrase, data }) {
  return new Promise((resolve, reject) => {
    /*
      >>> YOUR CODE HERE <<<
      resolve the handler with a formatted message object.
    */
    return resolve({
      message: {
        title: "Not implemented",
        text: "This functionnality is currently not implemented."
      }
    });
  });
}
/* </SKILL LOGIC> */
```

9. Edit the content of the sayJoke function to call your joke service:

```javascript
function sayJoke({ phrase, data }) {
  return new Promise((resolve, reject) => {
    request({
        method: "GET",
        url: "https://myjokeservice.lu/joke",
        callback: (err, res, body) => {
            return resolve({
                message: {
                    title: "A fun joke",
                    text: body.joke.text
                }
            });
        }
    });
  });
}
```

10. Save you Skill by clicking the **Save** icon. Your Skill is now up, and you may run it by toggling the red pill near its name in the **Skills* tab.
1. You may edit your skill and configure its secrets (let's say, if your API require authentification).
