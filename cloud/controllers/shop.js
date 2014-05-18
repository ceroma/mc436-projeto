var Product = Parse.Object.extend('Product'); 

// Renders the shop if user is logged in
exports.index = function(req, res) {
  if (!Parse.User.current()) {
    // Redirect to login if not logged in
    res.redirect('/login');
    return;
  }

  var current_user;
  Parse.User.current().fetch().then(function(user) {
    current_user = user;

    var query = new Parse.Query(Product);
    return query.find();
  }).then(function(products) {
    res.render('shop', { user : current_user, products : products });
  }, function(error) {
    res.send(500, 'Failed loading list of products');
  });
};
