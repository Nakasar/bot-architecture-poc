# PoC : Bot Architecture
> Proof of Concept of a Bot Architecture using microservices and skills.

## Architecture
![Diagram of Architecture](https://github.com/Nakasar/bot-architecture-poc/blob/master/docs/PoC%20Bot%20Architecture%20Diagram.png)

### Bot Connectors
Connectors are basically just pipelines to transfer messages from the chat itself to the bot's brain. All they do is basically handling their own permissions (and self-commands like `join`) and differencing direct commands from natural language requests.

Here is an example of a simple adapter using [Hubot](https://hubot.github.com/) for [RocketChat](https://rocket.chat/).

```javascript
code
```

### Skill Services
Skill Services are external microservices that may (or may not) by accessible by other application. One may return weather forecast, another may give informations about collaborators.

### Skills
Skills are small scripts executed by the brain node server. They expose their commands and intents. Skills are automatically loaded by the bot on startup, and may be added at runtime, or removed/disabled.
