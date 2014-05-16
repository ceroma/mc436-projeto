// These two lines are required to initialize Express in Cloud Code.
var express = require('express');
var app = express();

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

// This is an example of hooking up a request handler with a specific request
// path and HTTP verb using the Express routing API.
app.get('/hello', function(req, res) {
  res.render('hello', { message: 'Congrats, you just set up your app!' });
});

// Sign Up Screen
app.get('/signup', function(req, res) {
  res.render('signup');
});

// Sign Up Controller
app.post('/signup', function(req, res) {
  var newUser = new Parse.User();
  newUser.set("firstName", req.body.firstname);
  newUser.set("lastName", req.body.lastname);
  newUser.set("username", req.body.username);
  newUser.set("password", req.body.password);

  // Create new user
  newUser.signUp(null, {
    success: function(user) {
      // Say hello to new user
      res.render('hello', { message: 'Hello, ' + user.get("firstName") });
    },
    error: function(user, error) {
      // Redirect back to Sign Up form
      res.redirect('/signup');
    }
  });
});

// Log In Screen
app.get('/login', function(req, res) {
  res.render('login');
});

// Log In Controller
app.post('/login', function(req, res) {
  Parse.User.logIn(req.body.username, req.body.password).then(function() {
    // If login succeeds, redirect to main screen
    res.redirect('/');
  },
  function(error) {
    // If login fails, show login form again
    res.redirect('/login');
  });
});

// Log Out Controller
app.get('/logout', function(req, res) {
  if (Parse.User.current()) {
    Parse.User.logOut();
  }

  res.redirect('/');
});

// Main Screen
// Says hello if user is logged in, otherwise redirect to login form
app.get('/', function(req, res) {
  if (Parse.User.current()) {
    // Fetch user object and say hello
    Parse.User.current().fetch().then(function(user) {
      // Say hello to user
      res.render('hello', { message: 'Hello, ' + user.get("firstName") });
    },
    function(error) {
      // Show error message
      alert("Erro: " + error.code + " - " + error.message);
    });
  } else {
    // Redirect to login
    res.redirect('/login');
  }
});

// Attach the Express app to Cloud Code.
app.listen();
