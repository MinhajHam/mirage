const express = require('express');
const router = express.Router();
const Product = require("../../models/product");
const Coupon = require("../../models/coupon");
const Brand = require("../../models/brand");
const Color = require("../../models/subCategory/color");
const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif'];
const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));

// Render the main product page with filters and pagination
router.get('/', async (req, res, next) => {
  try {
    const selectedColor = req.query.color;
    const selectedBrand = req.query.brand;
    
    // Define the query based on selected color and brand
    const query = {};
    if (selectedColor) {
      query.color = selectedColor;
    }
    if (selectedBrand) {
      query.brand = selectedBrand;
    }

    const perPage = 6;
    const currentPage = req.query.page || 1;
    const skip = (currentPage - 1) * perPage;

    // Fetch products with pagination and populate the 'brand' field
    const products = await Product.find(query)
      .skip(skip)
      .limit(perPage)
      .populate('brand');

    const colors = await Color.find();
    const brands = await Brand.find();

    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / perPage);

    res.render("admin/product-control/indextest.ejs", {
      layout: false,
      indexUrl: req.session.indexUrl,
      products,
      selectedColor,
      selectedBrand,
      colors,
      brands,
      currentPage,
      totalPages,
    });
  } catch (error) {
    res.redirect('/admin');
  }
});

// Render the 'add' page for products
router.get('/add', async (req, res) => {
  const brands = await Brand.find();
  res.render('admin/product-control/add/add.ejs', { 
    indexUrl: req.session.indexUrl,
    layout: false,
    brand: new Brand(),
    color: new Color(),
    brands,
    errorMessage: req.session.brandError || ''
  });
});




// Render the 'add' page for products
router.get('/coupon', async (req, res) => {
  const brands = await Brand.find();
  res.render('admin/product-control/add/coupon.ejs', { 
    layout: false,
    brand: new Brand(),
    color: new Color(),
    brands,
    errorMessage:
    
    
    ''
  });
});














module.exports = router;
