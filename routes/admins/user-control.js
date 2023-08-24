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






















module.exports = router;
