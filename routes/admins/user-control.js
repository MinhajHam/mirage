const express = require('express');
const router = express.Router();
const User = require('../../models/user');
const Order = require('../../models/order');



// Render the index page for user control
router.get('/', (req, res) => {
  try {
    res.render('admin/user-control/index.ejs', {
      layout: false,
    });
  } catch (error) {
    console.error(error);
    res.redirect('/admin/user-control');
  }
});



// Render the user control page with search functionality
router.get('/user', async (req, res) => {
  let searchOptions = {};
  if (req.query.fname != null && req.query.fname !== '') {
    searchOptions.fname = new RegExp(req.query.fname, 'i');
  }
  try {
    const users = await User.find(searchOptions);
    res.render('admin/user-control/user.ejs', {
      layout: false,
      users,
      searchOptions: req.query,
    });
  } catch {
    res.redirect('/');
  }
});



// Block/unblock user based on status
router.put('/user/:id/block', async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (user.status == 'Active') {
      user.status = 'Blocked';
    } else {
      user.status = 'Active';
    }
    await user.save();
   

    return res.redirect('/admin/user-control/user');
  } catch (error) {
    console.error('Error blocking user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});



// Delete user
router.delete('/user/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    await User.findByIdAndRemove(userId); // Find and remove the user by ID
    res.redirect('/admin/user-control/user'); // Redirect to the user control page after deletion
  } catch (error) {
    console.error(error);
    res.redirect('/admin/user-control/user'); // Redirect to the user control page in case of an error
  }
});


// Order Control


// Render the order control page with search functionality
router.get('/order', async (req, res) => {
  try {
    const orders = await Order.find();
    res.render('admin/user-control/order.ejs', {
      layout: false,
      orders,
      searchOptions: req.query,
    });
  } catch {
    res.redirect('/');
  }
});














module.exports = router;
