if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

var express = require('express');
var router = express.Router();
const Cart = require('../models/cart');
const Product = require('../models/product');
const User = require('../models/user');
const bodyParser = require('body-parser');
router.use(bodyParser.json());
const Order = require('../models/order');
const Payment = require('../models/payment');
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY)
const {
  blockUserMiddleware,
  checkAuthenticated
} = require('../middleware/auth')
const paypal = require("@paypal/checkout-server-sdk")
const Environment =
  process.env.NODE_ENV === "production" ?
  paypal.core.LiveEnvironment :
  paypal.core.SandboxEnvironment
const paypalClient = new paypal.core.PayPalHttpClient(
  new Environment(
      process.env.PAYPAL_CLIENT_ID,
      process.env.PAYPAL_CLIENT_SECRET
  )
)



/* GET home page. */

router.get('/shipping', checkAuthenticated, async (req, res, next) => {
  const userId = req.user._id;
  try {
      const user = await User.findById(userId);
      res.render('checkout/shipping', {
          indexUrl: req.session.indexUrl,
          user: user,
      });
  } catch (error) {
      console.error('Error fetching user:', error);
      res.redirect('/checkout/cart');
  }
});
















module.exports = router;