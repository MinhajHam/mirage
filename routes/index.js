const express = require('express');
const router = express.Router();
const Wishlist = require('../models/wishlist');
const { checkAuthenticated } = require('../middleware/auth');


// Define routes and their handlers

router.get('/', async (req, res, next) => {
  req.session.indexUrl = 'men';
  res.redirect('/men');
});



router.get('/wishlist',checkAuthenticated, async (req, res, next) => {
  try {

   
    const userId = req.user._id;


    // Fetch the wishlists with pagination and populate the 'brand' field
    const wishlists = await Wishlist.findOne({ user_id: userId }).populate('items.product');



    res.render('wishlist.ejs', {
      indexUrl: req.session.indexUrl,
      wishlists: wishlists,
    });
  } catch(e) {
    console.log(e);
    res.redirect('/fail');
  }
});





router.post('/wishlist/:id/remove', async (req, res) => {
  try {



          const itemId = req.params.id;

          // Find the cart that contains the item to be removed
          const cart = await Wishlist.findOne({
              'items._id': itemId
          });

          if (!cart) {
              return res.status(404).json({
                  error: 'Item not found in the cart'
              });
          }

          // Find the index of the item to be removed within the cart's items array
          const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);

          if (itemIndex === -1) {
              return res.status(404).json({
                  error: 'Item not found in the cart'
              });
          }

          // Get the item being removed for later calculations
          const removedItem = cart.items[itemIndex];

          // Remove the item from the cart's items array
          cart.items.splice(itemIndex, 1);

          // Update the cart's subtotal_items, total, tax, and subtotal based on the removed item
          cart.total_items -= removedItem.quantity;
          cart.subtotal -= removedItem.subtotal;
          cart.tax -= removedItem.subtotal * 0.1; // Assuming tax is 10% of the removed item's subtotal
          cart.total -= removedItem.total;

          // Save the updated cart to the database
          await cart.save();

          res.redirect('/wishlist');

      

  } catch (error) {
      console.error('Error removing item from wish:', error);
      res.status(500).json({
          error: 'An error occurred while removing item from cart'
      });
  }
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

