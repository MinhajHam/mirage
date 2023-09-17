const express = require('express');
const router = express.Router();
const Payment = require("../../models/payment");
const MensBanner = require("../../models/mensbanner");
const imageMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'images/gif'];
const bodyParser = require('body-parser');
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
  try {
    // Create a new MensBanner instance with the relevant fields
    const mensBanner = new MensBanner();

    const imageArray = req.body.mainImage;
    const link = req.body.link1;
    const text = req.body.text1;

    if (!imageArray || imageArray.length === 0) {
      return res.redirect('/admin/noooo');
    }

    const maxCoverCount = 4;
    const coverCount = Math.min(imageArray.length, maxCoverCount);
    req.body.cover = imageArray.slice(0, coverCount);

    console.log("Before saveCovers:", mensBanner, link, text);
    
    // Add a log statement to confirm the function call
    saveCovers(mensBanner, req.body.mainImage, link, text);
    
    console.log("After saveCovers:", mensBanner); // Add a log statement after the function call

    await mensBanner.save();
    res.redirect('/admin/yes');
  } catch (error) {
    console.error("Error saving mensBanner:", error);
    res.redirect('/admin/no');
  }
});








// Export the router for use in other parts of your application
module.exports = router;
