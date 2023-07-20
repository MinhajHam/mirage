if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')
const bodyParser = require('body-parser')
const passport = require('passport')
const session = require('express-session')
const methodOverride = require('method-override')
const cors = require("cors")
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



app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')
app.use(expressLayouts)
app.use(methodOverride('_method'))
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }))
app.use(
  cors({
    origin: "http://localhost:5500",
  })
)


app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash());


const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true })
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.log('Connected to Mongoose'))

// Second Database URL
// const secondDBURL = process.env.SECOND_DATABASE_URL;
// const secondDBConnection = mongoose.createConnection(secondDBURL, { useNewUrlParser: true });
// secondDBConnection.on('error', error => {
//   console.error('Error connecting to Second Database:', error);
// });
// secondDBConnection.once('open', () => {
//   console.log('Connected to Second Database');
// }); 


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
  res.status(500).send('Internal Server Error');
});


app.listen((process.env.PORT || 8000), () => console.log('server started on designated port'))