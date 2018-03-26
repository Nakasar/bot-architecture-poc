let commands = {
  analyze : {
    cmd: 'analyze',
    execute: analyzeText,
    expected_args: ['phrase']
  }
}
let intents = {};
let dependencies = ['recastai'];

exports.commands = commands;
exports.intents = intents;
exports.dependencies = dependencies;

const recastai = require('recastai');
const secret = require('./secret');

const client = new recastai.request(secret.recastai_token, 'en');

function analyzeText(phrase = "") {
  return new Promise((resolve, reject) => {
    if (!client) {
      return reject();
    }
    console.log(`> [INFO] {nlp} - Analyze "${phrase}".`);
    client.analyseText(phrase).then((res) => {
      analyzed = { };
      analyzed.intent = res.intent() ? res.intent().slug : null;
      analyzed.entities = {};
      for (let entityName in res.entities) {
        analyzed.entities[entityName] = []
        for (let entity of res.entities[entityName]) {
          analyzed.entities[entityName].push(entity.raw);
        }
      }

      analyzed.message = res.intent() ? `I think your intent is *${res.intent().slug}*.` : `I did'nt found any intent in this sentence.`;

      return resolve(analyzed);
    })
  })
};
