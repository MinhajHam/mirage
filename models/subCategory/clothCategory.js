const mongoose = require('mongoose');

const clothCategory = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
});

module.exports = mongoose.model('ClothCategory', clothCategory);
