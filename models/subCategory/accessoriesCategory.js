const mongoose = require('mongoose');

const accessoriesCategory = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
});

module.exports = mongoose.model('AccessoriesCategory', accessoriesCategory);
