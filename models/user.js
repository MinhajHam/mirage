const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
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

const transactionSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
  },
  transactionType: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  operation: {
    type: String,
    enum: ['Deposit', 'Withdrawal'],
    required: true,
  },
});

const walletSchema = new mongoose.Schema({
  balance: {
    type: Number,
    default: 0,
  },
  transactions: [transactionSchema],
  
});

const userSchema = new mongoose.Schema({
  fname: {
    type: String,
    required: true,
  },
  lname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  otpSecret: {
    type: String,
  },
  status: {
    type: String,
    default: "Active",
  },
  orderCancellationCount: {
    type: Number,
    default: 0,
  },
  cart: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cart",
  },
  addresses: [addressSchema],
  wallet: walletSchema,
});

module.exports = mongoose.model("users", userSchema);
