'use strict';

let skills = [require('./nlp/skill'), require('./greetings/skill')];

exports.startSkill = function(skillName, phrase = undefined, analyzed = undefined) {
  return new Promise((resolve, reject) => {
    switch (skillName) {
      case "nlp":
        skills[0].analyzeText(phrase).then((analyzed) => {
          return resolve({ success: true, analyzed: analyzed, message: 'Phrase analyzed.', source: phrase });
        }).catch((err) => {
          return reject({ success: false, message: `Unknown error with nlp skill.` });
        })
        break;
      case "say-thanks":
        skills[1].sayThanks().then((response) => {
          return resolve({ success: true, message: response.message });
        })
        break;
      default:
        return resolve({ success: true, message: `I have no skill with this name ${skillName}. Maybe it was disabled :/` });
        break;
    }
  })
};
