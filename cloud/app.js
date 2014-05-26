// These two lines are required to initialize Express in Cloud Code.
var express = require('express');
var app = express();

// Controllers
var cartController = require('cloud/controllers/cart.js');
var homeController = require('cloud/controllers/home.js');
var shopController = require('cloud/controllers/shop.js');
var logInController = require('cloud/controllers/login.js');
var logOutController = require('cloud/controllers/logout.js');
var signUpController = require('cloud/controllers/signup.js');
var updateController = require('cloud/controllers/update.js');
var purchaseController = require('cloud/controllers/purchase.js');

// HTTPS and Cookie middlewares
var parseExpressHttpsRedirect = require('parse-express-https-redirect');
var parseExpressCookieSession = require('parse-express-cookie-session');

// Global app configuration section
app.set('views', 'cloud/views');      // Specify the folder to find templates
app.set('view engine', 'ejs');        // Set the template engine
app.use(parseExpressHttpsRedirect()); // Force user to be on HTTPS
app.use(express.bodyParser());        // Middleware for reading request body
app.use(express.cookieParser('SECRET'));
app.use(express.cookieSession({
  secret : 'SECRET2',
  cookie : { secure: true },
  proxy: true
}));
app.use(parseExpressCookieSession({ cookie: { maxAge: 3600000 } })); // 1h

// Custom CSRF middleware to disable the check on registration via FB
app.use(function(req, res, next) {
  var FACEBOOK_ORIGIN = 'https://www.facebook.com';
  if (req.path == '/signup' && req.get('origin') == FACEBOOK_ORIGIN) {
    next();
  } else {
    express.csrf()(req, res, next);
  }
});

// Custom middleware to make CSRF token available to all templates
app.use(function(req, res, next) {
  res.locals.csrf_token = req.session._csrf;
  next();
});

// Sign Up
app.get('/signup', signUpController.index);
app.post('/signup', signUpController.createNewUser);

// Log In
app.get('/login', logInController.index);
app.post('/login', logInController.logIn);
app.post('/login-facebook', logInController.logInFacebook);

// Log Out
app.post('/logout', logOutController.logOut);

// Home Screen
app.get('/', homeController.index);

// Shop Screen
app.get('/shop', shopController.index);

// Cart Manipulations
app.get('/cart/:id', cartController.show);
app.post('/cart/create', cartController.create);
app.get('/cart/:id/buy', purchaseController.selectMethod);
app.post('/cart/:id/buy', purchaseController.finalize);

// Purchase History
app.get('/history', purchaseController.showHistory);

// Update Info
app.get('/update', updateController.index);
app.post('/update', updateController.updateInfo);

// Attach the Express app to Cloud Code.
app.listen();
