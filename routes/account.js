const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Order = require('../models/order');
const Coupon = require('../models/coupon');
const Wishlist = require('../models/wishlist');
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

    res.render('account/orderView', { order, id: orderId });
  } catch (error) {
    console.error('Error viewing order:', error);
    return res.status(500).json({ error: 'Internal server error' });
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


router.get('/giftcard', checkAuthenticated, async (req, res) => {
  try {
    const userId = req.user._id;
    const order = await Order.findOne({ user_id: userId });
    
    const user = await User.findOne(userId).populate('wallet.transactions').exec();
    let walletBalance = Math.floor(user.wallet.balance);

    res.render('account/giftcard', { user: user, order: order, walletBalance: walletBalance });
  } catch (error) {
    console.log(error);
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


router.get('/wishlist', (req, res, next) => {
  res.render('account/creditcard');
});





// Add item to the wishlist
router.post('/wishlist/add',checkAuthenticated, async (req, res) => {

  try {
    console.log(req.session.authwishlist);

          const {
              userId,
              productId,
              size
          } = req.body;


          // Get the product details
          const product = await Product.findById(productId);

          if (!product) {
              return res.status(404).json({
                  error: 'Product not found'
              });
          }

          // Calculate wishlist values based on the product and quantity
          const price = product.price;
          // Find the user's wishlist or create a new wishlist if it doesn't exist
          let wishlist = await Wishlist.findOne({
              user_id: userId
          });
          if (!wishlist) {
              wishlist = new Wishlist({
                  user_id: userId,
                  items: [],
              });
          }

          const existingItemIndex = wishlist.items.findIndex(item => item.product.toString() === productId && item.size === size);
          if (existingItemIndex !== -1) {
              // Product already exists in the wishlist, you can handle this case if needed
          } else {
              // Create a new wishlist item
              const newItem = {
                  product: productId,
                  size: size, 
              };
              wishlist.items.push(newItem);
          }
          

          // Save the wishlist to the database
          await wishlist.save();

          res.redirect('/checkout/wishlist');

    

  } catch (error) {
      console.error('Error adding item to wishlist:', error);
      res.status(500).send('An error occurred while adding item to wishlist.');
  }
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
