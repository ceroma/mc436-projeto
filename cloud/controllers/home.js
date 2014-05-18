// Home Screen
// Redirects user to products page, otherwise redirects to login form
exports.index = function(req, res) {
  if (Parse.User.current()) {
    // Redirect to shop
    res.redirect('/shop');
  } else {
    // Redirect to login
    res.redirect('/login');
  }
};
