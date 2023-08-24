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

























module.exports = router;
