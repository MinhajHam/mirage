const mongoose = require('mongoose');

// Define the schema
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
  sizes: [
    {
    sizeName: {
      type: String,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
  },
],
  totalStock: {
    type: Number,
    required: true,
  },
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Brand'
  },
  coverImages: [
    {
      image: {
        type: Buffer,
        required: true,
      },
      imageType: {
        type: String,
        required: true,
      },
    },
  ],
});

productSchema.virtual('coverImagePath1').get(function() {
  if (this.coverImages && this.coverImages.length > 0) {
    const firstImage = this.coverImages[0]; // Assuming you want to use the first image
    return `data:${firstImage.imageType};charset=utf-8;base64,${firstImage.image.toString('base64')}`;
  }
  return null; // Handle case when no cover images are available
});


module.exports = mongoose.model('Product', productSchema);
