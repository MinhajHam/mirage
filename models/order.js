const mongoose = require("mongoose");
const User = require('../models/user');

const shippingAddressSchema = new mongoose.Schema({
  salutation: {
    type: String,
    required: true,
  },
  fname: {
    type: String,
    required: true,
  },
  lname: {
    type: String,
    required: true,
  },
  company: {
    type: String,
  },
  country: {
    type: String,
    required: true,
  },
  postcode: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  street: {
    type: String,
    required: true,
  },
  address2: {
    type: String,
  },
  phone: {
    type: String,
    required: true,
  },
});

const billingAddressSchema = new mongoose.Schema({
  salutation: {
    type: String,
    required: true,
  },
  fname: {
    type: String,
    required: true,
  },
  lname: {
    type: String,
    required: true,
  },
  company: {
    type: String,
  },
  country: {
    type: String,
    required: true,
  },
  postcode: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  street: {
    type: String,
    required: true,
  },
  address2: {
    type: String,
  },
  phone: {
    type: String,
    required: true,
  },
});

const trackSchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
  },
  note: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const itemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  size: { type: String, required: true },
  quantity: { type: Number, required: true },
  subtotal: { type: Number, required: true },
  total: { type: Number, required: true },
});

const cartSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
  },
  items: [itemSchema],

  total_items: {
    type: Number,
    required: true,
  },
  subtotal: {
    type: Number,
    required: true,
  },
  tax: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    required: true,
    default: "Active",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

const orderSchema = new mongoose.Schema({
  orderNo: {
    type: String,
  },
  user_id: {
    type: String,
    required: true,
  },
  cart: cartSchema,
  track: [trackSchema],
  shippingAddress: shippingAddressSchema,
  billingAddress: billingAddressSchema,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  message: {
    type: String,
    required: true,
    default: "You have no notes",
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    default: "Placed",
  },
});

orderSchema.pre('save', async function (next) {
  // Check if this is a cancellation
  if (this.isModified('status') && this.status === 'Cancelled') {

    // Increment the user's orderCancellationCount
    await User.findByIdAndUpdate(this.user_id, {
      $inc: { orderCancellationCount: 1 },
    });

    

    // Check if the user has reached 4 cancellations
    const user = await User.findById(this.user_id);

    if (user.orderCancellationCount >= 4) {
      await User.findByIdAndUpdate(this.user_id, {
        status: 'Blocked',
        flagged: true,
      });
    }
  }

  if (this.isModified('status') && this.status === 'Delivered') {

    // Increment the user's orderCancellationCount
    await User.findByIdAndUpdate(this.user_id, {
      $set: { orderCancellationCount: 1 },
    });
  }

  next();
});


module.exports = mongoose.model("Order", orderSchema);
