const express = require('express');
const https = require('https');
const fs = require('fs');
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');
const passport = require('passport');
const session = require('express-session');
const methodOverride = require('method-override');
const cors = require("cors");
const flash = require('express-flash');

const indexRoutes = require('./routes/index');
const loginRoutes = require('./routes/login');
const signupRoutes = require('./routes/signup');
const menRoutes = require('./routes/men');
const womenRoutes = require('./routes/women');
const checkoutRoutes = require('./routes/checkout');
const accountRoutes = require('./routes/account');
const adminRoutes = require('./routes/admins/admin');
const adminProductControlRoutes = require('./routes/admins/product-control');
const adminUserControlRoutes = require('./routes/admins/user-control');

const app = express();

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.set('layout', 'layouts/layout');
app.use(expressLayouts);
app.use(methodOverride('_method'));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }));
app.use(cors({ origin: "http://localhost:5500" }));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', error => console.error(error));
db.once('open', () => console.log('Connected to Mongoose'));

app.use('/', indexRoutes);
app.use('/login', loginRoutes);
app.use('/signup', signupRoutes);
app.use('/men', menRoutes);
app.use('/women', womenRoutes);
app.use('/checkout', checkoutRoutes);
app.use('/account', accountRoutes);
app.use('/admin', adminRoutes);
app.use('/admin/product-control', adminProductControlRoutes);
app.use('/admin/user-control', adminUserControlRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Internal Server Error', err.stack);
});

// Paths to SSL/TLS certificate and private key
const privateKeyPath = '/etc/letsencrypt/live/mirages.online/privkey.pem';
const certificatePath = '/etc/letsencrypt/live/mirages.online/fullchain.pem';

// Read the SSL/TLS certificate and private key
const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
const certificate = fs.readFileSync(certificatePath, 'utf8');

// Create credentials object
const credentials = { key: privateKey, cert: certificate };

// Create HTTPS server
const httpsServer = https.createServer(credentials, app);

// Start the HTTPS server on port 443
httpsServer.listen(443, () => {
  console.log('HTTPS server is running on port 443');
});

// Redirect HTTP to HTTPS middleware
app.use((req, res, next) => {
  if (req.secure) {
    // If the request is already secure (HTTPS), move on to the next middleware
    next();
  } else {
    // If the request is HTTP, redirect to HTTPS
    res.redirect(301, `https://${req.headers.host}${req.url}`);
  }
});

// Start the HTTP server on port 80 (optional)
app.listen((process.env.PORT || 8000), () => console.log('HTTP server is running on port 80'));
