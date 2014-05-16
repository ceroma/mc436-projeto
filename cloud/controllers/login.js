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
