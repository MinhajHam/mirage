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



// Block/unblock order based on status
router.put('/order/:id/block', async (req, res) => {
  const orderId = req.params.id;

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    if (order.status == 'Placed') {
      order.status = 'Cancelled';
    } else {
      order.status = 'Placed';
    }
    await order.save();
    

    return res.redirect('/admin/user-control/order');
  } catch (error) {
    console.error('Error blocking order:', error);
    return res.status(500).json({ error: 'Internal server error' });
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

    res.render('admin/user-control/view', { layout: false, order, id: orderId });
  } catch (error) {
    console.error('Error viewing order:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});



// Edit order details
router.post('/order/:id/edit', async (req, res) => {
  const orderId = req.params.id;
  const { status, message } = req.body;

  try {
    // Update the order's status and message
    await Order.findByIdAndUpdate(orderId, { $set: { status, message } });

    res.redirect('/admin/user-control/order'); // Redirect to the specified route
  } catch (error) {
    console.error('Error updating order:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});



router.put('/order/:id/cancel', async (req, res) => {
  const userId = req.user._id;
  const orderId = req.params.id;

  try {
    const order = await Order.findById(orderId);
    const user = await User.findById(userId).populate('wallet.transactions').exec();

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    if (order.status === 'Cancelled') {
      // Don't process the same cancellation request again
      return res.status(400).json({ error: 'Order is already cancelled' });
    }

    // Assuming order.cart.total is a positive number
    if (order.status !== 'Cancelled') {
      order.status = 'Cancelled';

      if (order.paymentMethod !== 'cod') {
      
      // Update the user's wallet balance and add a refund transaction
      if (!user.wallet) {
        user.wallet = { balance: 0, transactions: [] };
      }
      const refundAmount = order.cart.total;

      order.message = 'Your order cancelled and sent refund to your MIRAGE wallet'
      user.wallet.balance += refundAmount;
      user.wallet.transactions.push({
        amount: order.cart.total,
        transactionType: 'product cancellation refund',
        operation: 'Deposit',
      });
      

      // Save the updated user and order
      await user.save();
    }

      // update and save the order track
      const lastTrack = order.track[order.track.length - 1];
      lastTrack.status = 'pending';
      let newTrack = {
        status: 'cancel',
        note: 'Your order cancelled',
        created_at: new Date()
      }

      order.track.push(newTrack);

      await order.save();
    }

    return res.redirect('/account/orders');
  } catch (error) {
    console.error('Error cancelling order:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/order/:id/return', async (req, res) => {
  const userId = req.user._id;
  const orderId = req.params.id;

  try {
    const order = await Order.findById(orderId);
    const user = await User.findById(userId).populate('wallet.transactions').exec();

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    

    // Assuming order.cart.total is a positive number
    if (order.status !== 'Cancelled') {
      order.status = 'Return order';

      

      // update and save the order track
      const lastTrack = order.track[order.track.length - 1];
      lastTrack.status = 'pending';
      let newTrack = {
        status: 'end',
        note: 'requested for return order',
        created_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }

      order.track.push(newTrack);

      await order.save();
    }

    return res.redirect('/account/orders');
  } catch (error) {
    console.error('Error cancelling order:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});





module.exports = router;
