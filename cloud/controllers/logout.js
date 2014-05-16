// Logs User Out
exports.logOut = function(req, res) {
  if (Parse.User.current()) {
    Parse.User.logOut();
  }

  res.redirect('/');
};
