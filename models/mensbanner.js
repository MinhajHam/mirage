const mongoose = require("mongoose");

// Create a Mongoose schema for the main page banner
const mensBannerSchema = new mongoose.Schema({
  // Define the main image
  mainImage: [
     {
    param: {
      type: String,
      required: true,
    },
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

  // Define the main topic image
  mainTopicImage: {
    param: {
      type: String,
    },
    link: {
      type: String,
    },
    image: {
      type: Buffer,
    },
    imageType: {
      type: String, // Store the main topic image type (e.g., 'image/jpeg', 'image/png')
    },
  },

  // Define an array of topic images
  topicImages: [
    {
      paramnk: {
        type: String,

      },
      link: {
        type: String,

      },
      image: {
        type: Buffer,

      },
      imageType: {
        type: String, // Store each topic image type (e.g., 'image/jpeg', 'image/png')

      },
    },
  ],

  // Define "New Arrivals" images
  newArrivalsImages: [
    {
      paramnk: {
        type: String,

      },
      link: {
        type: String,

      },
      image: {
        type: Buffer,

      },
      imageType: {
        type: String,

      },
    },
    {
      paramnk: {
        type: String,

      },
      link: {
        type: String,

      },
      image: {
        type: Buffer,

      },
      imageType: {
        type: String,

      },
    },
  ],

  // Define "Shoes" images
  shoesImages: [
    {
      paramnk: {
        type: String,

      },
      link: {
        type: String,

      },
      image: {
        type: Buffer,

      },
      imageType: {
        type: String,

      },
    },
    {
      paramnk: {
        type: String,

      },
      link: {
        type: String,

      },
      image: {
        type: Buffer,

      },
      imageType: {
        type: String,

      },
    },
  ],

  // Define "Clothing" images
  clothingImages: [
    {
      paramnk: {
        type: String,

      },
      link: {
        type: String,

      },
      image: {
        type: Buffer,

      },
      imageType: {
        type: String,

      },
    },
    {
      paramnk: {
        type: String,

      },
      link: {
        type: String,

      },
      image: {
        type: Buffer,

      },
      imageType: {
        type: String,

      },
    },
  ],

  // Define "Bags" images
  bagsImages: [
    {
      paramnk: {
        type: String,

      },
      link: {
        type: String,

      },
      image: {
        type: Buffer,

      },
      imageType: {
        type: String,

      },
    },
    {
      paramnk: {
        type: String,

      },
      link: {
        type: String,

      },
      image: {
        type: Buffer,

      },
      imageType: {
        type: String,

      },
    },
  ],
});

// Create a Mongoose model for the main page banner using the schema
const MensBanner = mongoose.model("MensBanner", mensBannerSchema);

module.exports = MensBanner;
