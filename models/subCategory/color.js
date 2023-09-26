const mongoose = require('mongoose');

const color = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
});

module.exports = mongoose.model('Color', color);
