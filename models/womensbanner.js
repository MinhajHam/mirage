const mongoose = require('mongoose');

// Create a Mongoose schema for the main page banner
const womensBannerSchema = new mongoose.Schema({
  // Define the main image
  mainImage: {
    link: {
        type: String,
        required: true,
    },
    image: {
      type: Buffer,  
      required: true,
    },
    imageType: {
      type: String, // Store the main image type (e.g., 'image/jpeg', 'image/png')
      required: true,
    },
  },

  // Define the main topic image
  mainTopicImage: {
    link: {
        type: String,
        required: true,
    },
    image: {
      type: Buffer, 
      required: true,
    },
    imageType: {
      type: String, // Store the main topic image type (e.g., 'image/jpeg', 'image/png')
      required: true,
    },
  },

  // Define an array of topic images
  topicImages: [
    {
      link: {
        type: String,
        required: true,
      },
        image: {
        type: Buffer,  
        required: true,
      },
      imageType: {
        type: String, // Store each topic image type (e.g., 'image/jpeg', 'image/png')
        required: true,
      },
    },
  ],

  // Define "New Arrivals" images
  newArrivalsImages: [
    {
      link: {
        type: String,
        required: true,
      },
        image: {
        type: Buffer,
        required: true,
      },
      imageType: {
        type: String,
        required: true,
      },
    },
    {
      link: {
        type: String,
        required: true,
      },
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

  // Define "Shoes" images
  shoesImages: [
    {
      link: {
        type: String,
        required: true,
      },
        image: {
        type: Buffer,
        required: true,
      },
      imageType: {
        type: String,
        required: true,
      },
    },
    {
      link: {
        type: String,
        required: true,
      },
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

  // Define "Clothing" images
  clothingImages: [
    {
      link: {
        type: String,
        required: true,
      },
        image: {
        type: Buffer,
        required: true,
      },
      imageType: {
        type: String,
        required: true,
      },
    },
    {
      link: {
        type: String,
        required: true,
      },
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

  // Define "Bags" images
  bagsImages: [
    {
      link: {
        type: String,
        required: true,
      },
        image: {
        type: Buffer,
        required: true,
      },
      imageType: {
        type: String,
        required: true,
      },
    },
    {
      link: {
        type: String,
        required: true,
      },
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

// Create a Mongoose model for the main page banner using the schema
const WomensBanner = mongoose.model('WomensBanner', womensBannerSchema);

module.exports = WomensBanner;
