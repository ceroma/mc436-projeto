// Home Screen
// Says hello if user is logged in, otherwise redirects to login form
exports.index = function(req, res) {
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
};
