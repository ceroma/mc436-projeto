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

// HTTPS and Cookie middlewares
var parseExpressHttpsRedirect = require('parse-express-https-redirect');
var parseExpressCookieSession = require('parse-express-cookie-session');

// Global app configuration section
app.set('views', 'cloud/views');      // Specify the folder to find templates
app.set('view engine', 'ejs');        // Set the template engine
app.use(parseExpressHttpsRedirect()); // Force user to be on HTTPS
app.use(express.bodyParser());        // Middleware for reading request body
app.use(express.cookieParser('SECRET'));
app.use(parseExpressCookieSession({ cookie: { maxAge: 3600000 } })); // 1h

// Sign Up
app.get('/signup', signUpController.index);
app.post('/signup', signUpController.createNewUser);

// Log In
app.get('/login', logInController.index);
app.post('/login', logInController.logIn);
app.post('/login-facebook', logInController.logInFacebook);

// Log Out
app.get('/logout', logOutController.logOut);

// Home Screen
app.get('/', homeController.index);

// Shop Screen
app.get('/shop', shopController.index);

// Cart Manipulations
app.get('/cart/:id', cartController.show);
app.post('/cart/create', cartController.create);

// Attach the Express app to Cloud Code.
app.listen();
