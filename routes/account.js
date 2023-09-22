const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Order = require('../models/order');
const Coupon = require('../models/coupon');
const { checkAuthenticated } = require('../middleware/auth');


router.get('/', checkAuthenticated, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    res.render('account/index', { user: user });
  } catch (error) {
    console.log(error);
    res.redirect('/');    
  }
});










router.get('/creditcardlist', (req, res, next) => {
  res.render('account/creditcard');
});


module.exports = router;
