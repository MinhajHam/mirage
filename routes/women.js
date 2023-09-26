var express = require('express');
var router = express.Router();
var Product = require('../models/product')
var Brand = require('../models/brand')
var Color = require('../models/subCategory/color')



router.get('/', async (req, res, next) => {
  req.session.indexUrl = 'women'
  res.render('products/women/index.ejs', {
    indexUrl: req.session.indexUrl,
  });
});



router.get('/new', async (req, res, next) => {
  try {
    
    // Define the base query based on gender
    const query = { $or: [{ gender: 'women' }, { gender: 'unisex' }] };
    
    const selectedColor = req.query.color; // Get the selected color from query parameters
    const selectedBrand = req.query.brand; // Get the selected brand from query parameters
    const searchKeyword = req.query.keyword; // Get a search keyword from query parameters
    // Create a searchOptions object to hold filter criteria
    const searchOptions = {};

    // Add conditions to the searchOptions based on selectedColor, selectedBrand, and searchKeyword
    if (selectedColor) {
      searchOptions.color = selectedColor;
    }
    if (selectedBrand) {
      searchOptions.brand = selectedBrand;
    }
    if (searchKeyword) {
      // Use a regular expression to search for the keyword in product name or description
      searchOptions.$or = [
        { name: new RegExp(searchKeyword, 'i') },
        { description: new RegExp(searchKeyword, 'i') },
      ];
    }

    // Merge searchOptions into the query
    Object.assign(query, searchOptions);

    const perPage = 8; // Number of products to show per page
    const currentPage = req.query.page || 1; // Get the current page from query parameters
    const skip = (currentPage - 1) * perPage; // Calculate the number of products to skip

    // Fetch the products with pagination and populate the 'brand' field
    const products = await Product.find(query)
      .sort({ createdAt: 'desc' })
      .skip(skip)
      .limit(perPage)
      .populate('brand');

    const colors = await Color.find();
    const brands = await Brand.find();

    // Count the total number of products matching the query for pagination
    const totalProducts = await Product.countDocuments(query);

    // Calculate the total number of pages based on the total products and products per page
    const totalPages = Math.ceil(totalProducts / perPage);

    res.render('products/women/new.ejs', {
      indexUrl: req.session.indexUrl,
      products: products,
      selectedColor: selectedColor,
      selectedBrand: selectedBrand,
      searchKeyword: searchKeyword, // Pass the search keyword to the view
      colors: colors,
      brands: brands,
      currentPage: currentPage,
      totalPages: totalPages,
    });
  } catch {
    res.redirect('/');
  }
});




router.get('/clothing', async (req, res, next) => {
  try {
    const selectedColor = req.query.color; // Get the selected color from query parameters
    const selectedBrand = req.query.brand; // Get the selected brand from query parameters

    // Define the query based on category, gender, color, and brand (if selected)
    const query = { 
      $and: [
        { category: 'clothings' },
        { $or: [{ gender: 'women' }, { gender: 'unisex' }] }
      ]
    };
    const searchKeyword = req.query.keyword; // Get a search keyword from query parameters
    // Create a searchOptions object to hold filter criteria
    const searchOptions = {};

    // Add conditions to the searchOptions based on selectedColor, selectedBrand, and searchKeyword
    if (selectedColor) {
      searchOptions.color = selectedColor;
    }
    if (selectedBrand) {
      searchOptions.brand = selectedBrand;
    }
    if (searchKeyword) {
      // Use a regular expression to search for the keyword in product name or description
      searchOptions.$or = [
        { name: new RegExp(searchKeyword, 'i') },
        { description: new RegExp(searchKeyword, 'i') },
      ];
    }

    // Merge searchOptions into the query
    Object.assign(query, searchOptions);

    const perPage = 8; // Number of products to show per page
    const currentPage = req.query.page || 1; // Get the current page from query parameters
    const skip = (currentPage - 1) * perPage; // Calculate the number of products to skip

    // Fetch the products with pagination and populate the 'brand' field
    const products = await Product.find(query)
      .sort({ createdAt: 'desc' })
      .skip(skip)
      .limit(perPage)
      .populate('brand');

    const colors = await Color.find();
    const brands = await Brand.find();

    // Count the total number of products matching the query for pagination
    const totalProducts = await Product.countDocuments(query);

    // Calculate the total number of pages based on the total products and products per page
    const totalPages = Math.ceil(totalProducts / perPage);

    res.render('products/women/new.ejs', {
      indexUrl: req.session.indexUrl,
      products: products,
      selectedColor: selectedColor,
      selectedBrand: selectedBrand,
      searchKeyword: searchKeyword, // Pass the search keyword to the view
      colors: colors,
      brands: brands,
      currentPage: currentPage,
      totalPages: totalPages,
    });
  } catch {
    res.redirect('/');
  }
});

router.get('/shoe', async (req, res, next) => {
  try {
    const selectedColor = req.query.color; // Get the selected color from query parameters
    const selectedBrand = req.query.brand; // Get the selected brand from query parameters

    // Define the query based on category, gender, color, and brand (if selected)
    const query = { 
      $and: [
        { category: 'shoes' },
        { $or: [{ gender: 'women' }, { gender: 'unisex' }] }
      ]
    };
    const searchKeyword = req.query.keyword; // Get a search keyword from query parameters
    // Create a searchOptions object to hold filter criteria
    const searchOptions = {};

    // Add conditions to the searchOptions based on selectedColor, selectedBrand, and searchKeyword
    if (selectedColor) {
      searchOptions.color = selectedColor;
    }
    if (selectedBrand) {
      searchOptions.brand = selectedBrand;
    }
    if (searchKeyword) {
      // Use a regular expression to search for the keyword in product name or description
      searchOptions.$or = [
        { name: new RegExp(searchKeyword, 'i') },
        { description: new RegExp(searchKeyword, 'i') },
      ];
    }

    // Merge searchOptions into the query
    Object.assign(query, searchOptions);

    const perPage = 8; // Number of products to show per page
    const currentPage = req.query.page || 1; // Get the current page from query parameters
    const skip = (currentPage - 1) * perPage; // Calculate the number of products to skip

    // Fetch the products with pagination and populate the 'brand' field
    const products = await Product.find(query)
      .sort({ createdAt: 'desc' })
      .skip(skip)
      .limit(perPage)
      .populate('brand');

    const colors = await Color.find();
    const brands = await Brand.find();

    // Count the total number of products matching the query for pagination
    const totalProducts = await Product.countDocuments(query);

    // Calculate the total number of pages based on the total products and products per page
    const totalPages = Math.ceil(totalProducts / perPage);

    res.render('products/women/new.ejs', {
      indexUrl: req.session.indexUrl,
      products: products,
      selectedColor: selectedColor,
      selectedBrand: selectedBrand,
      searchKeyword: searchKeyword, // Pass the search keyword to the view
      colors: colors,
      brands: brands,
      currentPage: currentPage,
      totalPages: totalPages,
    });
  } catch {
    res.redirect('/');
  }
});


router.get('/bags', async (req, res, next) => {
  try {
    const selectedColor = req.query.color; // Get the selected color from query parameters
    const selectedBrand = req.query.brand; // Get the selected brand from query parameters

    // Define the query based on category, gender, color, and brand (if selected)
    const query = { 
      $and: [
        { category: 'bags' },
        { $or: [{ gender: 'women' }, { gender: 'unisex' }] }
      ]
    };
    const searchKeyword = req.query.keyword; // Get a search keyword from query parameters
    // Create a searchOptions object to hold filter criteria
    const searchOptions = {};

    // Add conditions to the searchOptions based on selectedColor, selectedBrand, and searchKeyword
    if (selectedColor) {
      searchOptions.color = selectedColor;
    }
    if (selectedBrand) {
      searchOptions.brand = selectedBrand;
    }
    if (searchKeyword) {
      // Use a regular expression to search for the keyword in product name or description
      searchOptions.$or = [
        { name: new RegExp(searchKeyword, 'i') },
        { description: new RegExp(searchKeyword, 'i') },
      ];
    }

    // Merge searchOptions into the query
    Object.assign(query, searchOptions);

    const perPage = 8; // Number of products to show per page
    const currentPage = req.query.page || 1; // Get the current page from query parameters
    const skip = (currentPage - 1) * perPage; // Calculate the number of products to skip

    // Fetch the products with pagination and populate the 'brand' field
    const products = await Product.find(query)
      .sort({ createdAt: 'desc' })
      .skip(skip)
      .limit(perPage)
      .populate('brand');

    const colors = await Color.find();
    const brands = await Brand.find();

    // Count the total number of products matching the query for pagination
    const totalProducts = await Product.countDocuments(query);

    // Calculate the total number of pages based on the total products and products per page
    const totalPages = Math.ceil(totalProducts / perPage);

    res.render('products/women/new.ejs', {
      indexUrl: req.session.indexUrl,
      products: products,
      selectedColor: selectedColor,
      selectedBrand: selectedBrand,
      searchKeyword: searchKeyword, // Pass the search keyword to the view
      colors: colors,
      brands: brands,
      currentPage: currentPage,
      totalPages: totalPages,
    });
  } catch {
    res.redirect('/');
  }
});


router.get('/accessories', async (req, res, next) => {
  try {
    const selectedColor = req.query.color; // Get the selected color from query parameters
    const selectedBrand = req.query.brand; // Get the selected brand from query parameters

    // Define the query based on category, gender, color, and brand (if selected)
    const query = { 
      $and: [
        { category: 'accessories' },
        { $or: [{ gender: 'women' }, { gender: 'unisex' }] }
      ]
    };
    const searchKeyword = req.query.keyword; // Get a search keyword from query parameters
    // Create a searchOptions object to hold filter criteria
    const searchOptions = {};

    // Add conditions to the searchOptions based on selectedColor, selectedBrand, and searchKeyword
    if (selectedColor) {
      searchOptions.color = selectedColor;
    }
    if (selectedBrand) {
      searchOptions.brand = selectedBrand;
    }
    if (searchKeyword) {
      // Use a regular expression to search for the keyword in product name or description
      searchOptions.$or = [
        { name: new RegExp(searchKeyword, 'i') },
        { description: new RegExp(searchKeyword, 'i') },
      ];
    }

    // Merge searchOptions into the query
    Object.assign(query, searchOptions);

    const perPage = 8; // Number of products to show per page
    const currentPage = req.query.page || 1; // Get the current page from query parameters
    const skip = (currentPage - 1) * perPage; // Calculate the number of products to skip

    // Fetch the products with pagination and populate the 'brand' field
    const products = await Product.find(query)
      .sort({ createdAt: 'desc' })
      .skip(skip)
      .limit(perPage)
      .populate('brand');

    const colors = await Color.find();
    const brands = await Brand.find();

    // Count the total number of products matching the query for pagination
    const totalProducts = await Product.countDocuments(query);

    // Calculate the total number of pages based on the total products and products per page
    const totalPages = Math.ceil(totalProducts / perPage);

    res.render('products/women/new.ejs', {
      indexUrl: req.session.indexUrl,
      products: products,
      selectedColor: selectedColor,
      selectedBrand: selectedBrand,
      searchKeyword: searchKeyword, // Pass the search keyword to the view
      colors: colors,
      brands: brands,
      currentPage: currentPage,
      totalPages: totalPages,
    });
  } catch {
    res.redirect('/');
  }
});



router.get('/jewelry', async (req, res, next) => {
  try {
    const selectedColor = req.query.color; // Get the selected color from query parameters
    const selectedBrand = req.query.brand; // Get the selected brand from query parameters

    // Define the query based on category, gender, color, and brand (if selected)
    const query = { 
      $and: [
        { category: 'jewelry' },
        { $or: [{ gender: 'women' }, { gender: 'unisex' }] }
      ]
    };
    const searchKeyword = req.query.keyword; // Get a search keyword from query parameters
    // Create a searchOptions object to hold filter criteria
    const searchOptions = {};

    // Add conditions to the searchOptions based on selectedColor, selectedBrand, and searchKeyword
    if (selectedColor) {
      searchOptions.color = selectedColor;
    }
    if (selectedBrand) {
      searchOptions.brand = selectedBrand;
    }
    if (searchKeyword) {
      // Use a regular expression to search for the keyword in product name or description
      searchOptions.$or = [
        { name: new RegExp(searchKeyword, 'i') },
        { description: new RegExp(searchKeyword, 'i') },
      ];
    }

    // Merge searchOptions into the query
    Object.assign(query, searchOptions);

    const perPage = 8; // Number of products to show per page
    const currentPage = req.query.page || 1; // Get the current page from query parameters
    const skip = (currentPage - 1) * perPage; // Calculate the number of products to skip

    // Fetch the products with pagination and populate the 'brand' field
    const products = await Product.find(query)
      .sort({ createdAt: 'desc' })
      .skip(skip)
      .limit(perPage)
      .populate('brand');

    const colors = await Color.find();
    const brands = await Brand.find();

    // Count the total number of products matching the query for pagination
    const totalProducts = await Product.countDocuments(query);

    // Calculate the total number of pages based on the total products and products per page
    const totalPages = Math.ceil(totalProducts / perPage);

    res.render('products/women/new.ejs', {
      indexUrl: req.session.indexUrl,
      products: products,
      selectedColor: selectedColor,
      selectedBrand: selectedBrand,
      searchKeyword: searchKeyword, // Pass the search keyword to the view
      colors: colors,
      brands: brands,
      currentPage: currentPage,
      totalPages: totalPages,
    });
  } catch {
    res.redirect('/');
  }
});




router.get('/sale', async (req, res, next) => {
  try {
    const selectedColor = req.query.color; // Get the selected color from query parameters
    const selectedBrand = req.query.brand; // Get the selected brand from query parameters

    // Define the query based on category, gender, color, and brand (if selected)
    const query = { 
      $and: [
        { category: 'accessories' },
        { $or: [{ gender: 'women' }, { gender: 'unisex' }] }
      ]
    };
    const searchKeyword = req.query.keyword; // Get a search keyword from query parameters
    // Create a searchOptions object to hold filter criteria
    const searchOptions = {};

    // Add conditions to the searchOptions based on selectedColor, selectedBrand, and searchKeyword
    if (selectedColor) {
      searchOptions.color = selectedColor;
    }
    if (selectedBrand) {
      searchOptions.brand = selectedBrand;
    }
    if (searchKeyword) {
      // Use a regular expression to search for the keyword in product name or description
      searchOptions.$or = [
        { name: new RegExp(searchKeyword, 'i') },
        { description: new RegExp(searchKeyword, 'i') },
      ];
    }

    // Merge searchOptions into the query
    Object.assign(query, searchOptions);

    const perPage = 8; // Number of products to show per page
    const currentPage = req.query.page || 1; // Get the current page from query parameters
    const skip = (currentPage - 1) * perPage; // Calculate the number of products to skip

    // Fetch the products with pagination and populate the 'brand' field
    const products = await Product.find(query)
      .sort({ createdAt: 'desc' })
      .skip(skip)
      .limit(perPage)
      .populate('brand');

    const colors = await Color.find();
    const brands = await Brand.find();

    // Count the total number of products matching the query for pagination
    const totalProducts = await Product.countDocuments(query);

    // Calculate the total number of pages based on the total products and products per page
    const totalPages = Math.ceil(totalProducts / perPage);

    res.render('products/women/new.ejs', {
      indexUrl: req.session.indexUrl,
      products: products,
      selectedColor: selectedColor,
      selectedBrand: selectedBrand,
      searchKeyword: searchKeyword, // Pass the search keyword to the view
      colors: colors,
      brands: brands,
      currentPage: currentPage,
      totalPages: totalPages,
    });
  } catch {
    res.redirect('/');
  }
});




router.get('/:id', async (req, res) => {
  try {
    let userId = null;
    if (req.user) {
      userId = req.user.id;
    }

    const product = await Product.findById(req.params.id)
                           .populate('brand')
                           .exec();
    res.render('products/women/view.ejs', { 
      indexUrl: req.session.indexUrl,
      product: product,
      userId: userId
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.redirect('/');
  }
});




module.exports = router;