let commands = {
  weather : {
    cmd: 'weather',
    execute: getWeather,
    expected_args: ['location']
  }
}
let intents = {
  'weather-weather': {
    slug: 'weather',
    handle: handleWeather,
    expected_entities: ['location']
  }
};
let dependencies = ['request'];

exports.commands = commands;
exports.intents = intents;
exports.dependencies = dependencies;

const request = require('request');

const serviceURL = "http://localhost:5012";

function getWeather(phrase) {
  return new Promise((resolve, reject) => {

    let location = phrase;
    if (location.length <= 0) {
      return resolve({
        message: `I need a location (like \`Kayl, lu\`).`
      });
    }

    console.log(`> [INFO] {weather} - Get weather for "${location}".`);
    request({
      baseUrl: serviceURL,
      uri: '/weather',
      qs: {
        location: location
      },
      json: true,
      callback: (err, res, body) => {
        if (!err && body && body.success) {
          let weatherMessage = `Here is the current weather for *${body.weather.name}*:`
          weatherMessage += `\nSky: ${body.weather.weather[0].main}`;
          resolve({
            message: weatherMessage
          });
        } else {
          resolve({
            message: "I couldn't load weather for this location :/"
          });
        }
      }
    });
  });
};

function handleWeather({ location: location = "" }) {
  let finalLocation = location[0];
  return getWeather(finalLocation);
}
