if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}


const express = require('express');
const session = require('express-session');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
const Users = require('../models/user');
const sendMail = require('../varify'); 
const randomstring = require('randomstring');

// Temporary data store to hold user data until verification
const tempUserData = {};


router.use(session({
  secret: process.env.SESSION_SECRET, 
  resave: false,
  saveUninitialized: true
}));


router.get('/', checkNotAuthenticated, (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.render('user/signup', { users: new Users(), layout: false });
});



// POST / POST / POST / POST / POST /
// / POST / POST / POST / POST / POST
// POST / POST / POST / POST / POST /
// / POST / POST / POST / POST / POST


// Function to send OTP and store temporary user data
async function sendOTPAndStoreData(email, hashedPassword) {
  const otp = randomstring.generate({ length: 6, charset: 'numeric' });

  // Send the OTP to the user's email
  const subject = 'OTP Verification';
  const text = `Your OTP for verification is: ${otp}`;
  const html = `<p>Your OTP for verification is: <strong>${otp}</strong></p>`;

  // Store user data in tempUserData with the email as the key
  tempUserData[email] = {
    hashedPassword,
    otpSecret: otp,
  };

  // Send email
  await sendMail(email, subject, text, html);

  return otp;
}

// Route to handle user registration
router.post('/', checkNotAuthenticated, async (req, res) => {
  try {
    const { fname, lname, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Check if the user already exists
    const existingUser = await Users.findOne({ email });
    if (existingUser) {
      console.log("User with this email already exists");
      return res.redirect('/signup?message=User%20already%20exists');
    }

    // Store the 'toEmail' value in the session
    req.session.toEmail = email;
    req.session.fname = fname;
    req.session.lname = lname;

    // Send OTP and store temporary user data
    const otp = await sendOTPAndStoreData(email, hashedPassword);

    console.log('Email sent successfully');
    res.redirect('/signup/verify'); // Redirect to the OTP verification page
  } catch (error) {
    console.error(error.message);
    res.redirect('/signup'); // Redirect to signup page on error
  }
});

// Route to handle OTP verification
router.post('/verify', async (req, res) => {
  const { otp } = req.body;
  const email = req.session.toEmail;

  console.log('Received OTP:', otp);
  console.log('Stored OTP:', tempUserData[email]?.otpSecret);

  // Check if the provided OTP matches the stored OTP for the email
  if (tempUserData[email] && tempUserData[email].otpSecret === otp) {
    // If OTP matches, save the user data in the database
    const { hashedPassword } = tempUserData[email];
    const newUser = {
      fname: req.session.fname,
      lname: req.session.lname,
      email,
      password: hashedPassword,
      otpSecret: otp,
    };

    // Use findOneAndUpdate to either find and update or create a new user
    const options = { upsert: true, new: true, useFindAndModify: false };
    const updatedUser = await Users.findOneAndUpdate({ email }, newUser, options);

    delete tempUserData[email]; // Remove the user data from tempUserData

    res.redirect('/login'); // Redirect to a success page or the home page
  } else {
    console.log('error', email, otp);
    res.render('user/verifyotp', {
      layout: false,
      email,
      error: 'Invalid OTP. Please try again.',
    });
  }

  // Add a timeout here to redirect the user to a timeout page after 2 minutes
  const timeoutDuration = 1 * 60 * 1000; // 2 minutes in milliseconds
  setTimeout(() => {
    res.redirect('/signup/timeout'); // Redirect to a timeout page
  }, timeoutDuration);
});

// Function to render OTP verification page
router.get('/verify', (req, res) => {
  const toEmail = req.session.toEmail; // Retrieve 'toEmail' value from the session
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.render('user/verifyotp', { email: toEmail, layout: false });
});


router.get('/timeout', (req, res) => {
  res.render('user/timeout', {
    message: 'Your session has timed out. Please try again.',
    layout: false,
  });
});




function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}


module.exports = router;
