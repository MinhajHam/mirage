const express = require('express');
const router = express.Router();
const moment = require('moment');
const User = require('../models/user');
const Order = require('../models/order');
const Coupon = require('../models/coupon');
const Product = require('../models/product');
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
      .populate('track')
      .exec();

    res.render('account/orders', { order:orders });
  } catch (error) {
    console.error(error);
    // Handle the error gracefully
  }
});


// View details of a specific order
router.get('/order/:id/view', async (req, res) => {
  const orderId = req.params.id;

  try {
    const order = await Order.findById(orderId)
      .populate({
        path: 'cart',
        populate: {
          path: 'items.product',
        },
      });

    // Calculate the difference in days between now and updated_at
    const daysDifference = moment().diff(order.updated_at, 'days');

    // Calculate how many days are left to reach 7 days
    const daysLeft = 7 + daysDifference;

    // Set returnOrder based on the condition
    const returnOrder = daysDifference > -7;

    res.render('account/orderView', { order, id: orderId, returnOrder, daysLeft });
  } catch (error) {
    console.error('Error viewing order:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});



router.get('/info',checkAuthenticated, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    res.render('account/info', { user: user });
  } catch (error) {
    console.log(error);
    res.redirect('/');    
  }
});

router.get('/addresses', checkAuthenticated, async (req, res, next) => {
  const userId = req.user._id;
  const user = await User.findOne(userId);

  res.render('account/address', { user });
});



router.post('/addresses', checkAuthenticated, async (req, res) => {
  try {
    const userId = req.user._id;
    const newAddress = {
      salutation: req.body.salutation,
      fname: req.body.fname,
      lname: req.body.lname,
      company: req.body.company,
      country: req.body.country,
      postcode: req.body.postcode,
      city: req.body.city,
      street: req.body.street,
      address2: req.body.address2,
      phone: req.body.phone,
    };
    const user = await User.findOne(userId);

    // Add the new address to the user's addresses
    user.addresses.push(newAddress);

    // Save the user's data to the database
    await user.save();
    res.redirect('/account/addresses');
  } catch (error) {
    console.error("Error saving address:", error);
    res.redirect('/account/nope');
  }
});


router.post('/addresses/:id/remove', async (req, res) => {
  try {
    const addressId = req.params.id;

    // Find the user that contains the address to be removed
    const user = await User.findOne({
      'addresses._id': addressId
    });

    if (!user) {
      return res.status(404).json({
        error: 'Address not found'
      });
    }

    // Find the index of the address to be removed within the user's addresses array
    const itemIndex = user.addresses.findIndex(item => item._id.toString() === addressId);

    if (itemIndex === -1) {
      return res.status(404).json({
        error: 'Address not found'
      });
    }

    // Get the address being removed for later calculations
    const removedAddress = user.addresses[itemIndex];

    // Remove the address from the user's addresses array
    user.addresses.splice(itemIndex, 1);
    await user.save();

    res.redirect('/account/addresses');
  } catch (error) {
    console.error('Error removing address:', error);
    res.status(500).json({
      error: 'An error occurred while removing address'
    });
  }
});




router.get('/giftcard', checkAuthenticated, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Use findOne with a query object
    const order = await Order.findOne({ user_id: userId });

    // Use findById to find a user by ID and populate the wallet transactions
    const user = await User.findById(userId).populate('wallet.transactions').exec();
    
    // Check if the user or user.wallet is null before accessing properties
    let walletBalance = 0;
    if (user && user.wallet) {
      walletBalance = Math.floor(user.wallet.balance);
    }

    res.render('account/giftcard', { user, order, walletBalance });
  } catch (error) {
    console.error(error);
    res.redirect('/account');
  }
});


router.post('/wallet-redeem', async (req, res) => {
  const redeemCode = req.body.redeemCode;

  try {
    // Check if the coupon code exists in the database
    const coupon = await Coupon.findOne({ code: redeemCode });

    if (!coupon) {
      // Coupon code not found, redirect to a failure page or show an error message
      return res.redirect('/coupon-not-found');
    }

    // Check if the coupon is active
    if (!coupon.isActive) {
      // Coupon is not active, redirect to a failure page or show an error message
      return res.redirect('/coupon-not-active');
    }

    // Check if the coupon has expired
    const currentDate = new Date();
    if (currentDate < coupon.validFrom || currentDate > coupon.validTo) {
      // Coupon is expired, redirect to a failure page or show an error message
      return res.redirect('/coupon-expired');
    }

    // Check if the coupon has been fully used (maxUses reached)
    if (coupon.maxUses !== null && coupon.currentUses >= coupon.maxUses) {
      // Coupon has been fully used, redirect to a failure page or show an error message
      return res.redirect('/coupon-max-uses-reached');
    }

    // If all validation checks pass, you can proceed to apply the coupon
    const userId = req.user._id;
    const user = await User.findOne(userId).populate('wallet.transactions').exec();

    if (coupon.walletUse === 'true') {
      if (!user.wallet) {
        user.wallet = { balance: 0, transactions: [] };
      }
      let redeemAmount = coupon.discountValue;

      user.wallet.balance += redeemAmount;
      user.wallet.transactions.push({
        amount: coupon.discountValue,
        transactionType: 'Mirage Gift Card',
        operation: 'Deposit',
      });
      coupon.currentUses += 1;

      // Save the updated user and coupon
      await user.save();
      await coupon.save();
    } else {
    return res.redirect('/fail');
    }



    return res.redirect('/account/giftcard');
  } catch (error) {
    console.error(error);
    return res.redirect('/fail');
  }
});





router.get('/creditcardlist', (req, res, next) => {
  res.render('account/creditcard');
});





// router.get('/:id/edit', async (req, res) => {
//   try {
//     const address = await Address.findById(req.params.id);
//     renderEditPage(res, product);
//   } catch {
//     res.redirect('/');
//   }
// });

module.exports = router;
