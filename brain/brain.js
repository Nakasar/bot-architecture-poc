'use strict';
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const PORT = 8080;
const HOST = '0.0.0.0';

app.set('title', 'Bot Brain Interface');
app.set('views', './dashboard/views');
app.set('view engine', 'pug');

app.use(bodyParser.urlencoded({
    extended: false
}))
app.use(bodyParser.json())

app.use(cookieParser());

let db = require('./database/db');
db.connect();

let router = require('./router.js');
app.use(router);

app.listen(PORT, HOST, () => console.log(`\n\x1b[36m> [INFO] Bot brain listening on http://${HOST}:${PORT}!\x1b[0m`));
