const mongoose = require('mongoose');

const jewelryCategory = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
});

module.exports = mongoose.model('JewelryCategory', jewelryCategory);
