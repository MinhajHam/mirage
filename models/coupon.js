const mongoose = require('mongoose')

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed_amount'],
    required: true,
  },
  discountValue: {
    type: Number,
    required: true,
  },
  validFrom: {
    type: Date,
    required: true,
  },
  validTo: {
    type: Date,
    required: true,
  },
  maxUses: {
    type: Number,
    default: null, // Set to null for unlimited uses
  },
  walletUse: {
    type: String,
    enum: ['true', 'false'],
    required: true,
  },
  currentUses: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model('Coupon', couponSchema)