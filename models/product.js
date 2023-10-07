const mongoose = require('mongoose');

const path = require('path')

const coverImageBasePath = 'uploads/productCovers'


const productSchema = new mongoose.Schema({
  productNo: {
    type: Number,
    default: function() {
      return Math.floor(Math.random() * 90000) + 10000;
    },
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  discount: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  gender: {
    type: String,
    enum: ['unisex', 'men', 'women', 'boy', 'girl'], 
    required: true,
  },
  category: {
    type: String,
    enum: ['clothings', 'shoes', 'bags', 'accessories', 'jewelry'],
    required: true,
  },
  subCategory: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
  sizes: {
    XS: {
      type: Number,
      default: 0,
      min: 0,
    },
    S: {
      type: Number,
      default: 0,
      min: 0,
    },
    M: {
      type: Number,
      default: 0,
      min: 0,
    },
    L: {
      type: Number,
      default: 0,
      min: 0,
    },
    XL: {
      type: Number,
      default: 0,
      min: 0,
    },
    XXL: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  totalStock: {
    type: Number,
    required: true,
  },
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Brand'
  },
  coverImageNames: [
    {
      type: String,
      required: true,
    },
  ],
  
});


productSchema.virtual('coverImagePaths').get(function () {
  if (this.coverImageNames && this.coverImageNames.length > 0) {
    return this.coverImageNames.map((imageName) =>
      path.join('/', 'uploads/productCovers', imageName)
    );
  }
  return []; // Return an empty array when no cover images are available
});


productSchema.virtual('coverImagePath1').get(function () {
  if (this.coverImageNames && this.coverImageNames.length > 0) {
    return path.join('/', 'uploads/productCovers', this.coverImageNames[0]);
  }
  return null; // Handle case when no cover images are available
});

productSchema.virtual('coverImagePath2').get(function () {
  if (this.coverImageNames && this.coverImageNames.length > 1) {
    return path.join('/', 'uploads/productCovers', this.coverImageNames[1]);
  }
  return null; // Handle case when no second cover image is available
});


module.exports = mongoose.model('Product', productSchema);
module.exports.coverImageBasePath = coverImageBasePath;