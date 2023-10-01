const express = require('express');
const router = express.Router();
const Payment = require("../../models/payment");
const Brand = require("../../models/brand");
const Coupon = require("../../models/coupon");
const Color = require("../../models/subCategory/color");
const MensBanner = require("../../models/mensbanner");
const imageMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'images/gif'];
const bodyParser = require('body-parser');
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);
router.use(bodyParser.urlencoded({ extended: true }));

// Define a route to handle GET requests at the root ('/')
router.get('/', async (req, res) => {
  try {
    // Set cache control headers to prevent caching
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    // Fetch all payments and populate the 'order' field
    const payments = await Payment.find();

    // Get the current date and time
    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Calculate date ranges for various periods
    const currentWeekStart = new Date(currentDate);
    currentWeekStart.setDate(currentDate.getDate() - currentDate.getDay()); // Start of the week (Sunday)

    const currentWeekEnd = new Date(currentWeekStart);
    currentWeekEnd.setDate(currentWeekStart.getDate() + 6); // End of the week (Saturday)

    const currentMonthStart = new Date(currentYear, currentMonth, 1);
    const currentMonthEnd = new Date(currentYear, currentMonth + 1, 0);
    const currentDayStart = new Date(currentYear, currentMonth, currentDay);
    const currentDayEnd = new Date(currentYear, currentMonth, currentDay, 23, 59, 59, 999);
    const currentYearStart = new Date(currentYear, 0, 1);
    const currentYearEnd = new Date(currentYear, 11, 31, 23, 59, 59, 999);

    // Filter payments for various date ranges
    const weeklyPayments = payments.filter(payment => {
      const paymentDate = new Date(payment.paymentDate);
      return paymentDate >= currentWeekStart && paymentDate <= currentWeekEnd;
    });

    const monthlyPayments = payments.filter(payment => {
      const paymentDate = new Date(payment.paymentDate);
      return paymentDate >= currentMonthStart && paymentDate <= currentMonthEnd;
    });

    const dailyPayments = payments.filter(payment => {
      const paymentDate = new Date(payment.paymentDate);
      return paymentDate >= currentDayStart && paymentDate <= currentDayEnd;
    });

    const yearlyPayments = payments.filter(payment => {
      const paymentDate = new Date(payment.paymentDate);
      return paymentDate >= currentYearStart && paymentDate <= currentYearEnd;
    });

    // Calculate revenues for various periods
    const dayRevenue = dailyPayments.reduce((total, payment) => total + payment.amount, 0);
    const weekRevenue = weeklyPayments.reduce((total, payment) => total + payment.amount, 0);
    const monthRevenue = monthlyPayments.reduce((total, payment) => total + payment.amount, 0);
    const yearRevenue = yearlyPayments.reduce((total, payment) => total + payment.amount, 0);

    // Render the 'admin/indextest.ejs' template with calculated data
    res.render('admin/indextest.ejs', {
      title: 'Express',
      layout: false,
      payment: payments,
      dayRevenue: dayRevenue,
      weekRevenue: weekRevenue,
      monthRevenue: monthRevenue,
      yearRevenue: yearRevenue,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});



router.get('/mens-banner', (req, res, next) => {
  res.render('admin/banner/mens.ejs', {layout: false});
});




router.post('/men-main-image', async (req, res) => {
  const mensBanner = new MensBanner({
    // Assuming your schema has properties like 'param' and 'link'
    param: req.body.text1,
    link: req.body.link1,
  });

  const coverArray = req.body.cover;

  if (!coverArray || coverArray.length === 0) {
    return renderNewPage(res, mensBanner, true, "At least one cover image is required.");
  }

  const maxCoverCount = 4;
  const coverCount = Math.min(coverArray.length, maxCoverCount);
  req.body.cover = coverArray.slice(0, coverCount);

  saveCovers(mensBanner, req.body.cover, req.body.link1, req.body.text1, 'mainImage');

  try {
    const newBanner = await mensBanner.save();
    res.redirect('/admin/mens-banner');
  } catch (error) {
    console.error("Error saving mens banner:", error);
    // Handle error as needed, maybe render an error page
    // or redirect back to the form with an error message
    res.render('your-error-view', { error: "Failed to save mens banner" });
  }
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




router.post('/create-coupon', async (req, res) => {
  try {
    // Extract form data from the request body
    const { code, description, discountType, discountValue, validFrom, validTo, maxUses, walletUse } = req.body;

    // Create a new coupon document
    const newCoupon = new Coupon({
      code,
      description,
      discountType,
      walletUse,
      discountValue,
      validFrom,
      validTo,
      maxUses,
    });

    // Save the coupon to the database
    await newCoupon.save();
    console.log(walletUse);

  if (walletUse == 'false') {
    createCoupon(code, discountType, discountValue, maxUses, description);
  }

    

    res.redirect('/admin/coupon');
  } catch (error) {
    // Handle errors (e.g., validation errors, database errors)
    res.status(500).send('Error creating coupon: ' + error.message);
  }
});







async function createCoupon(code, discountType, discountValue, maxUses, description) {
  try {
    let discount;
    let useCount;

    if (discountType == 'percentage') {
      discount = { percent_off: discountValue };
    } else {
      let stripeCoin = discountValue * 100
      discount = { amount_off: stripeCoin };
    }

    if (maxUses > 1) {
      useCount = { max_redemptions: maxUses };
    } else {
      useCount = {};
    }

    const coupon = await stripe.coupons.create({
      ...discount,
      currency: 'usd',
      ...useCount,
      name: description, 
      id: code,
    });

    console.log('Coupon created:', coupon);
  } catch (error) {
    console.error('Error creating coupon:', error.message);
  }
}






function saveCovers(banner, coverEncodedArray, link, param, section) {
  if (!Array.isArray(coverEncodedArray)) {
    return;
  }

  const coverImages = [];

  for (const coverEncoded of coverEncodedArray) {
    try {
      const cover = JSON.parse(coverEncoded);

      if (cover != null && imageMimeTypes.includes(cover.type)) {
        const imageBuffer = Buffer.from(cover.data, 'base64');
        const imageType = cover.type;
        coverImages.push({ param, link, image: imageBuffer, imageType });
      }
    } catch (error) {
      console.error("Error parsing cover image:", error);
    }
  }

  if (coverImages.length > 0) {
    // Assuming section is a valid section in mensBannerSchema
    banner[section] = coverImages;
  }
}


// Export the router for use in other parts of your application
module.exports = router;
