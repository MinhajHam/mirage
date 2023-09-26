const mongoose = require('mongoose');

const shoesCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
});

module.exports = mongoose.model('ShoesCategory', shoesCategorySchema);
