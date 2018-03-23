'use strict';
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.set('title', 'Bot Brain Interface');
app.set('views', './dashboard/views');
app.set('view engine', 'pug');

app.use(bodyParser.urlencoded({
    extended: false
}))
app.use(bodyParser.json())

let router = require('./router.js');
app.use(router);

app.listen(3000, () => console.log('\n\x1b[36m> [INFO] Bot brain listening on port 3000!\x1b[0m'))
