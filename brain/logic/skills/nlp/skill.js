let commands = {
  analyze : {
    cmd: 'analyze',
    execute: analyzeText,
    expected_args: 'phrase'
  }
}
let intents = {};
let dependencies = ['recastai'];

exports.commands = commands;
exports.intents = intents;
exports.dependencies = dependencies;

const recastai = require('recastai')

const client = new recastai.request('ffde2e6e88745852df01e71e55e60e81', 'en')

function analyzeText(string) {
  return new Promise((resolve, reject) => {
    if (!client) {
      return reject();
    }
    client.analyseText(string).then((res) => {
      analyzed = { };
      analyzed.intent = res.intent() ? res.intent().slug : null;
      analyzed.entities = res.entities || {};
      return resolve(analyzed);
    })
  })
};
