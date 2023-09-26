

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Users = require('../models/user');
const passport = require('passport');
const sendMail = require('../varify'); 
const randomstring = require('randomstring');
const { getUserByEmail, getUserById } = require('../passport/user-repository'); // Import the necessary modules for user lookup or integration with a database
const initializePassport = require('../passport/passport-config');

initializePassport(passport, getUserByEmail, getUserById);



const tempUserData = {};


router.get('/',checkNotAuthenticated, (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.render('user/login.ejs', {layout: false});
});

router.post('/', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/open',
  failureRedirect: '/login',
  failureFlash: true
}));


router.get('/forgot_pass', (req, res) => {
  // res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.render('user/pass_reset.ejs');
});

router.post('/forgot_pass', async (req, res) => {
  const otp = randomstring.generate({ length: 6, charset: 'numeric' });
  try {
    let userEmail = req.body.email;  
    const user = await Users.findOne({ email: userEmail });
    if (!user) {
    console.log("No user registered with this email");
    res.redirect('/login?message=User%20dont%20exists');
    } else {
    // Store the 'toEmail' value in the session
    req.session.toEmail = req.body.email;

    // Send the OTP to the user's email
    const toEmail = req.body.email;
    const subject = 'OTP Verification';
    const text = `Your OTP for verification is: ${otp}`;
    const html = `<p>Your OTP for verification is: <strong>${otp}</strong></p>`;

    // Store user data in tempUserData with the email as the key
    tempUserData[toEmail] = {
      otpSecret: otp,
    };

    sendMail(toEmail, subject, text, html)
      .then((result) => {
        console.log('forg Email sent...', result);
        res.redirect('/login/verify'); // Redirect to the OTP verification page
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

router.get('/verify', (req, res) => {
  const toEmail = req.session.toEmail; // Retrieve 'toEmail' value from the session
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.render('user/passotp', { email: toEmail });
});




router.post('/verify', async (req, res) => {
  const otp = req.body.otp;
  const email = req.session.toEmail; // Retrieve 'toEmail' value from the session

  console.log('Received OTP:', otp)
  console.log('Sended OTP:', tempUserData[email].otpSecret);

  // Check if the provided OTP matches the stored OTP for the email
  if (tempUserData[email] && tempUserData[email].otpSecret === otp) {
    // If OTP matches, save the user data in the database


    try {
      const user = await Users.findOne({ email });
      delete tempUserData[email]; // Remove the user data from tempUserData

      res.redirect(`/login/${encodeURIComponent(user._id)}`); // Redirect to a success page or the home page
    } catch (err) {
      console.error(err);
      res.redirect('/login'); // Redirect to the signup page on save failure
    }
  } else {
    console.log('error', email, otp);
    res.render('user/passotp', {
      email: email,
      error: 'Invalid OTP. Please try again.',
    });
  }
});


router.get('/:id', async (req, res) => {
  const user = await Users.findById(req.params.id)
  res.render('user/newPass.ejs', { user: user });
})



router.put('/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await Users.findById(userId);
    const { password, confirmPassword } = req.body;

    if (password === confirmPassword) {
      if (user) {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      user.password = hashedPassword;

      await user.save();
      res.redirect('/login');
    } else {
      res.redirect('/logn');
    }
  } else {
    console.log("miss match");
  }
  } catch (error) {
    console.error(error);
    res.redirect('/admin/userlog'); 
  }
});


function blockUserMiddleware(req, res, next) {
  if (req.user && req.user.role === 'Blocked') {
    return res.status(403).send('Access is restricted. You are blocked.');
  }
  next();
};

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}


module.exports = router;