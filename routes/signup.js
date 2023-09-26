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

router.post('/', checkNotAuthenticated, async (req, res) => {
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  const otp = randomstring.generate({ length: 6, charset: 'numeric' });
  const users = new Users({
    fname: req.body.fname,
    lname: req.body.lname,
    email: req.body.email,
    password: hashedPassword,
    otpSecret: otp,
  });

  try {
    let userEmail = req.body.email;  
    const user = await Users.findOne({ email: userEmail });
    if (user) {
    console.log("Already registered a user with this email");
    res.redirect('/signup?message=User%20already%20exists');
    } else {
    // Store the 'toEmail' value in the session
    req.session.toEmail = req.body.email;
    req.session.fname = req.body.fname;
    req.session.lname = req.body.lname;

    // Send the OTP to the user's email
    const toEmail = req.body.email;
    const subject = 'OTP Verification';
    const text = `Your OTP for verification is: ${otp}`;
    const html = `<p>Your OTP for verification is: <strong>${otp}</strong></p>`;

    // Store user data in tempUserData with the email as the key
    tempUserData[toEmail] = {
      hashedPassword: hashedPassword,
      otpSecret: otp,
    };

    sendMail(toEmail, subject, text, html)
      .then((result) => {
        console.log('Email sent...', result);
        res.redirect('/signup/verify'); // Redirect to the OTP verification page
      })
      .catch((error) => {
        console.log(error.message);
        res.redirect('/signup'); // Redirect to signup page on email sending failure
      });
    }
  } catch (err) {
    console.error(err);
    res.redirect('/signup');
  }
});

// GET GET GET GET GET GET GET GET GET GET
// GET GET GET GET GET GET GET GET GET GET
// GET GET GET GET GET GET GET GET GET GET
// GET GET GET GET GET GET GET GET GET GET


router.get('/verify', (req, res) => {
  const toEmail = req.session.toEmail; // Retrieve 'toEmail' value from the session
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.render('user/verifyotp', { email: toEmail });
});

// POST POST POST POST POST POST POST POST POST POST
// POST POST POST POST POST POST POST POST POST POST
// POST POST POST POST POST POST POST POST POST POST
// POST POST POST POST POST POST POST POST POST POST
// Route to handle OTP verification
router.post('/verify', async (req, res) => {
  const otp = req.body.otp;
  const email = req.session.toEmail; // Retrieve 'toEmail' value from the session

  console.log('Received OTP:', otp)
  console.log('Sended OTP:', tempUserData[email].otpSecret);

  // Check if the provided OTP matches the stored OTP for the email
  if (tempUserData[email] && tempUserData[email].otpSecret === otp) {
    // If OTP matches, save the user data in the database
    const { hashedPassword } = tempUserData[email];
    const users = new Users({
      fname: req.session.fname,
      lname: req.session.lname,
      email: email,
      password: hashedPassword,
      otpSecret: otp,
    });

    try {
      const newUsers = await users.save();
      delete tempUserData[email]; // Remove the user data from tempUserData

      res.redirect('/login'); // Redirect to a success page or the home page
    } catch (err) {
      console.error(err);
      res.redirect('/signup'); // Redirect to the signup page on save failure
    }
  } else {
    console.log('error', email, otp);
    res.render('user/verifyotp', {
      email: email,
      error: 'Invalid OTP. Please try again.',
    });
  }
});

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}


module.exports = router;
