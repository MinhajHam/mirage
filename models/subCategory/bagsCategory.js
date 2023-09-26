const mongoose = require('mongoose');

const bagsCategory = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
});

module.exports = mongoose.model('BagsCategory', bagsCategory);
