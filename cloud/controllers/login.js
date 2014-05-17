// Renders Log In Screen
exports.index = function(req, res) {
  res.render('login');
};

// Logs User In
exports.logIn = function(req, res) {
  Parse.User.logIn(req.body.username, req.body.password).then(function() {
    // If login succeeds, redirect to main screen
    res.redirect('/');
  },
  function(error) {
    // If login fails, show login form again
    res.redirect('/login');
  });
};

// Logs User In Via Facebook
exports.logInFacebook = function(req, res) {
  Parse.User.become(req.body.token).then(function() {
    // The current user was changed successfully
    res.send();
  },
  function(error) {
    // Something went wrong
    res.send();
  });
};
