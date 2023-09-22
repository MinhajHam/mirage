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



router.get('/orders', checkAuthenticated, async (req, res) => {
  try {
    const userId = req.user._id;
    const orders = await Order.find({ user_id: userId })
      .sort({ createdAt: 'desc' })
      .populate({
        path: 'cart',
        populate: {
          path: 'items.product',
        },
      })
      .exec();

    res.render('account/orders', { order:orders });
  } catch (error) {
    console.error(error);
    // Handle the error gracefully
  }
});


router.get('/info', (req, res) => {
  res.render('account/info');
});

router.get('/addresses', checkAuthenticated, async (req, res, next) => {
  const userId = req.user._id;
  const user = await User.findOne(userId);

  res.render('account/address', { user });
});









router.get('/creditcardlist', (req, res, next) => {
  res.render('account/creditcard');
});


module.exports = router;
