// Renders Sign Up Screen
exports.index = function(req, res) {
  res.render('signup');
};

// Creates New User
exports.createNewUser = function(req, res) {
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
};
