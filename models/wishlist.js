const mongoose = require("mongoose");


const itemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  size: { type: String, required: true },
});

const wishlistSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
  },
  items: [itemSchema],

  
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});


module.exports = mongoose.model("Wishlist", wishlistSchema);
