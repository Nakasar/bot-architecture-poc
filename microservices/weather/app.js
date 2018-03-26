const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const request = require('request');

const weatherServiceUrl = "http://api.openweathermap.org/data/2.5/weather";

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

app.get('/weather', (req, res, next) => {
  let location = req.query.location || req.body.location;
  if (location) {
    request({
      uri: weatherServiceUrl,
      qs: {
        appid: '6be46422ddeb7ed9e6e6061f0722efa2',
        q: location
      },
      json: true,
      callback: (err, response, body) => {
        if (err) {
          console.log(err.stack);
          return res.json({ success: false, message: 'An error occured whiel fetching weather api service.' });
        } else if (body.cod == 200) {
          console.log('> [INFO] Weather successfully fetched.');
          return res.json({ success: true, weather: body });
        } else {
          console.log('> [WARNING] Error with API weather service:\n\t' + body.message);
          return res.json({ success: false, message: 'An error occured whith weather api service.' });
        }
      }
    });
  } else {
    return res.json({ success: false, message: 'No location provided.' });
  }
});

app.get('*', (req, res, next) => {
  return res.status(404).json({ success: false, message: "404" });
})

app.listen(5012, () => {
  console.log('\n\x1b[36m> [INFO] Weather microservice listening on port 5000!\x1b[0m')
  console.log("> [INFO] Will use external service for weather: " + weatherServiceUrl);
});
