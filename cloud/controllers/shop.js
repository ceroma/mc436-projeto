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

  var last_cart;
  var current_user;
  var purchased_cart;
  Parse.User.current().fetch().then(function(user) {
    current_user = user;
    last_cart = current_user.get('lastCart');

    // Check whether we just came from a purchase
    if (req.query.cart) {
      var query = new Parse.Query(Cart);
      return query.get(req.query.cart);
    } else {
      return Parse.Promise.error();
    }

  }).then(function(cart) {
    // User can see the purchased cart, we'll show success notice
    last_cart = null;
    purchased_cart = cart;
    return Parse.Promise.as();

  }, function(error) {
    // No purchase, or user can't see cart, or invalid cart ID
    purchased_cart = null;

    // Fetch last cart, so we can remind user
    if (last_cart) {
      return last_cart.fetch();
    } else {
      return Parse.Promise.as();
    }

  }).then(function() {
    // Fetch all available products..
    var query = new Parse.Query(Product);

    // .. or just the ones that match the search
    if (req.query.q) {
      query.matches('name', req.query.q, 'i');
    }

    return query.find();

  }).then(function(products) {
    res.render('shop', {
      user : current_user,
      products : products,
      search_query : req.query.q,
      purchased_cart : purchased_cart ? purchased_cart.id : null,
      pending_cart : (last_cart && last_cart.canRemind()) ? last_cart.id : null
    });
  }, function(error) {
    res.send(500, 'Failed loading list of products');
  });
};
