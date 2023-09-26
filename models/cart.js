const mongoose = require("mongoose");


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
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});


module.exports = mongoose.model("Cart", cartSchema);
