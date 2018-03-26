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

const recastai = require('recastai')

const client = new recastai.request('ffde2e6e88745852df01e71e55e60e81', 'en')

function analyzeText(phrase = "") {
  return new Promise((resolve, reject) => {
    if (!client) {
      return reject();
    }
    console.log(`> [INFO] {nlp} - Analyze "${phrase}".`);
    client.analyseText(phrase).then((res) => {
      analyzed = { };
      analyzed.intent = res.intent() ? res.intent().slug : null;
      analyzed.entities = res.entities || {};
      analyzed.message = res.intent() ? `I think your intent is *${res.intent().slug}*.` : `I did'nt found any intent in this sentence.`;
      return resolve(analyzed);
    })
  })
};
