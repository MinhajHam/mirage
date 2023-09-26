const express = require('express');
const router = express.Router();
const Product = require('../models/product');


// Define routes and their handlers

router.get('/', async (req, res, next) => {
  req.session.indexUrl = 'men';
  res.redirect('/men');
});

router.get('/open', async (req, res, next) => {
  req.session.indexUrl = 'men';
  res.redirect('/men');
});

router.get('/test', async (req, res, next) => {
  res.render('test');
});

router.get('/blocked', async (req, res, next) => {
  res.render('partials/block');
});

router.delete('/logout', (req, res) => {
  req.logout(function (err) {
    if (err) {
      console.error(err);
      return res.redirect('/');
    }
    res.redirect('/');
  });
});

module.exports = router;

