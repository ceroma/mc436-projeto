var Cart = Parse.Object.extend('Cart', {
  canRemind: function() {
    // Don't remind if it was already bought
    if (this.get('purchase')) {
      return false;
    }

    // Can't see cart after 1h without buying it
    var one_hour_in_ms = 60 * 60 * 1000;
    var now = (new Date()).getTime();
    var creation_time = (new Date(this.createdAt)).getTime();
    return (now - creation_time) < one_hour_in_ms;
  }
});
var Product = Parse.Object.extend('Product'); 

// Renders the shop if user is logged in
exports.index = function(req, res) {
  // Redirect to login if not logged in
  if (!Parse.User.current()) {
    res.redirect('/login');
    return;
  }

  var current_user;
  Parse.User.current().fetch().then(function(user) {
    current_user = user;

    // Fetch last cart, so we can remind user
    var last_cart = user.get('lastCart');
    if (last_cart) {
      return last_cart.fetch();
    } else {
      return Parse.Promise.as();
    }

  }).then(function() {
    // Fetch all available products
    var query = new Parse.Query(Product);
    return query.find();

  }).then(function(products) {
    var last_cart = current_user.get('lastCart');
    res.render('shop', {
      user : current_user,
      products : products,
      pending_cart : (last_cart && last_cart.canRemind()) ? last_cart : null
    });
  }, function(error) {
    res.send(500, 'Failed loading list of products');
  });
};
