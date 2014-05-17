// Home Screen
// Says hello if user is logged in, otherwise redirects to login form
exports.index = function(req, res) {
  if (Parse.User.current()) {
    // Fetch user object and say hello
    Parse.User.current().fetch().then(function(user) {
      // Say hello to user
      var first_name = user.get('name').split(' ')[0];
      res.render('hello', { message: 'Hello, ' + first_name + '!' });
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
