const mongoose = require("mongoose");



const imageSchema = new mongoose.Schema({
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
});


// Create a Mongoose schema for the main page banner
const mensBannerSchema = new mongoose.Schema({
  // Define the main image
  mainImage: [imageSchema],

  // // Define the main topic image
  // mainTopicImage: [imageSchema],

  // // Define an array of topic images
  // topicImages:[imageSchema],

  // // Define "New Arrivals" images
  // newArrivalsImages: [imageSchema],

  // // Define "Shoes" images
  // shoesImages: [imageSchema],

  // // Define "Clothing" images
  // clothingImages: [imageSchema],

  // // Define "Bags" images
  // bagsImages: [imageSchema],
});


mensBannerSchema.virtual('mainImagePath').get(function() {
  if (this.mainImage && this.mainImage.length > 0) {
    const firstImage = this.mainImage[0]; // Assuming you want to use the first image
    return `data:${firstImage.imageType};charset=utf-8;base64,${firstImage.image.toString('base64')}`;
  }
  return null; // Handle case when no main images are available
});

// Create a Mongoose model for the main page banner using the schema
const MensBanner = mongoose.model("MensBanner", mensBannerSchema);

module.exports = MensBanner;
