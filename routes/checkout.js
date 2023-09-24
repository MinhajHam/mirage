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


router.post('/shipping', async (req, res, next) => {
  try {
      const {
          shipAddress,
          billAddress
      } = req.body;


      const userId = req.user._id;

      // Find the user by ID
      const user = await User.findById(userId);

      if (!user) {
          return res.status(404).json({
              message: "User not found"
          });
      }

      // Find the shipping address by ID
      const sessionshipAddress = user.addresses.find((address) => address._id.toString() === shipAddress);

      if (!sessionshipAddress) {
          return res.status(404).json({
              message: "Shipping address not found"
          });
      }

      // Store the found shipping address in the session (you can customize this based on your session setup)
      req.session.shipAddress = sessionshipAddress;

      if (billAddress == undefined) {
          req.session.billAddress = sessionshipAddress;
      } else {
          const sessionbillAddress = user.addresses.find((address) => address._id.toString() === billAddress);

          req.session.billAddress = sessionbillAddress;
      }

      res.redirect('/checkout/payment')
  } catch (error) {
      console.error("Error during shipping checkout:", error);
      res.status(500).json({
          message: "Internal server error"
      });
  }
})


router.get('/payment', (req, res, next) => {
  res.render('checkout/payment', {
      indexUrl: req.session.indexUrl,
  });
});


router.post('/payment', (req, res, next) => {
  try {
      const {
          paymethod
      } = req.body;
      req.session.paymentMethod = paymethod;
      res.redirect('/checkout/confirmation')
  } catch (error) {
      res.redirect('/checkout/payment')
  }
});

router.get('/confirmation', async (req, res, next) => {
  try {
      const userId = req.user._id;
      const user = await User.findOne(userId).populate('wallet.transactions').exec();
      const cart = await Cart.findOne({
          user_id: userId
      }).populate('items.product');
      const shipAddress = req.session.shipAddress;
      const billAddress = req.session.billAddress;
      const paymethod = req.session.paymentMethod;

      res.render('checkout/confirmation', {
          indexUrl: req.session.indexUrl,
          user: user,
          ship: shipAddress,
          bill: billAddress,
          paymethod: paymethod,
          cart: cart,
          paypalClientId: process.env.PAYPAL_CLIENT_ID,
      });
  } catch (error) {
      console.log(error);
      res.redirect('/checkout/failed')
  }
});



router.get('/updateProducts', async (req, res, next) => {
  try {
      function generateRandomCode() {
          const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
          const randomLetter = letters[Math.floor(Math.random() * letters.length)];
          const randomNumber = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
          return randomLetter + randomNumber;
      }

      
        const userId = req.user._id;

        const user = await User.findOne(userId).populate('wallet.transactions').exec();
        
      

      const randomCode = generateRandomCode();
      const shipAddress = req.session.shipAddress;

      const fname = shipAddress.fname;
      const lname = shipAddress.lname;

      const paymethod = req.session.paymentMethod;
      const cart = await Cart.findOne({
          user_id: userId
      }).populate('items.product');

      let amount = cart.total;
      let currStatus;
      if (paymethod == 'cod') {
          currStatus = 'Pending'
      } else {
          currStatus = 'Success'
      }
      

      const newOrder = new Order({
          orderNo: randomCode,
          paymentMethod: req.session.paymentMethod,
          user_id: userId,
          cart: cart,
          shippingAddress: shipAddress,
          billingAddress: shipAddress,
      })

      await newOrder.save();

      const newPayment = new Payment({
          fname: fname,
          lname: lname,
          orderNo: randomCode,
          order: newOrder,
          paymentMethod: paymethod,
          amount: amount,
          status: currStatus,
      })

      await newPayment.save();



        if (user && user.wallet && user.wallet.balance !== undefined) {
            let newAmount = user.wallet.balance - req.session.newBalance;

            user.wallet.transactions.push({
                amount: -newAmount,
                transactionType: 'Debited to Purchase',
                operation: 'Withdrawal',
              });

        user.wallet.balance = req.session.newBalance;
        await user.save();
        } 


      res.redirect('/checkout/saveorder');
  } catch (error) {
      console.log(error);
      res.redirect('/checkout/fail')
  }
});



router.get('/saveorder', async (req, res) => {
  try {
      const userId = req.user._id;

      ;

      // Find the cart by user_id
      const cart = await Cart.findOne({
          user_id: userId
      });

      console.log(cart);

      if (!cart) {
          return res.status(404).json({
              message: 'Cart not found'
          });
      }

      // Loop through items in the cart
      for (const item of cart.items) {
          const product = await Product.findById(item.product);

          if (!product) {
              continue; // Move to the next item if product not found
          }

          // Update product stock and total stock
          const sizeIndex = product.sizes.findIndex(size => size.sizeName === item.size);
          if (sizeIndex !== -1) {
              product.sizes[sizeIndex].stock -= item.quantity;
              product.totalStock -= item.quantity;
              await product.save();
          }
      }

      await cart.deleteOne();

      res.render('checkout/save', {
          indexUrl: req.session.indexUrl,
      })
  } catch (error) {
      console.error(error);
      return res.status(500).json({
          message: 'Error updating products and cart'
      });
  }
});












module.exports = router;