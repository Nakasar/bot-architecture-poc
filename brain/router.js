'use strict';
const express = require('express');
let router = express.Router();
let dashboardRouter = require('./dashboard/router');


// Main middleware
router.use((req, res, next) => {
  next();
});

// Bot Brain main endpoit
router.get('/', (req, res) => {
  res.render('index', { title: 'Bot Brain Interface', mainTitle: "Bot Brain Interface" });
});

// Routing dashboard requests
router.use('/dashboard', dashboardRouter);

// 404 Error
router.get('*', (req, res) => {
  res.status(404).json({ success: false, status: 404, message: 'Endpoint not found.' });
});

// Error handling (logging)
router.use((err, req, res, next) => {
  console.log(err.stack)
  res.status(500).json({ success: false, status: 500, message: 'Internal Server Error.' });
});


module.exports = router;
