var Cart = Parse.Object.extend('Cart', {
  canBuy: function() {
    // Can't buy if it was already bought
    if (this.get('purchase')) {
      return false;
    }

    // Can't buy cart after 1h without buying it
    var one_hour_in_ms = 60 * 60 * 1000;
    var now = (new Date()).getTime();
    var creation_time = (new Date(this.createdAt)).getTime();
    return (now - creation_time) < one_hour_in_ms;
  }
});
var Purchase = Parse.Object.extend('Purchase');

var ERROR_UPDATE_USER_INFO = 1;

// Asks users for a payment method
exports.selectMethod = function(req, res) {
  // Redirect to login if not logged in
  if (!Parse.User.current()) {
    res.redirect('/login');
    return;
  }

  var cart_id = req.params.id;

  Parse.User.current().fetch().then(function(user) {
    // Can only buy if user has address and email
    if (!user.get('email') || !user.get('address')) {
      return Parse.Promise.error(ERROR_UPDATE_USER_INFO);
    }

    var query = new Parse.Query(Cart);
    return query.get(cart_id);

  }).then(function(cart) {
    // First check whether user can buy cart
    if (!cart.canBuy()) {
      return Parse.Promise.error();
    }

    // Calculate total price
    var total = 0;
    for (var i = 0; i < cart.get('quantities').length; i++) {
      total += cart.get('quantities')[i] * cart.get('pricesPerUnit')[i];
    }

    res.render('purchase', { cart_id : cart.id, total : total });
  }, function(error) {
    if (error == ERROR_UPDATE_USER_INFO) {
      // Redirect user to update page
      res.redirect('/update?cart=' + cart_id);
    } else {
      // Redirect back to shop if user can't see this cart
      res.redirect('/shop');
    }
  });
};

// Finalizes the purchase
exports.finalize = function(req, res) {
  // Redirect to login if not logged in
  if (!Parse.User.current()) {
    res.redirect('/login');
    return;
  }

  var cart_id = req.params.id;
  var purchase_method = req.body.method;

  var current_cart;
  var current_user;
  var query = new Parse.Query(Cart);
  query.get(cart_id).then(function(cart) {
    current_cart = cart;

    // First check whether user can buy cart
    if (!cart.canBuy()) {
      return Parse.Promise.error();
    }

    // Fetch user so we can create relation
    return Parse.User.current().fetch();

  }).then(function(user) {
    current_user = user;

    // Can only buy if cart is user's lastCart
    if (current_cart.id != user.get('lastCart').id) {
      return Parse.Promise.error();
    }

    // Can only buy if user has address and email
    if (!user.get('email') || !user.get('address')) {
      return Parse.Promise.error(ERROR_UPDATE_USER_INFO);
    }

    // Create the purchase entry
    var new_purchase = new Purchase();
    new_purchase.set('method', purchase_method);
    new_purchase.set('cart', current_cart);
    current_cart.set('purchase', new_purchase);

    // Make sure only user can see his/her purchase!!
    new_purchase.setACL(new Parse.ACL(user));
    return new_purchase.save();

  }).then(function(purchase) {
    // Update user info
    current_user.set('lastCart', null);
    var relation = current_user.relation('purchases');
    relation.add(purchase);
    return current_user.save();

  }).then(function() {
    res.redirect('/shop');
  }, function(error) {
    if (error == ERROR_UPDATE_USER_INFO) {
      // Redirect user to update page
      res.redirect('/update?cart=' + cart_id);
    } else {
      // Redirect back to shop if user can't see this cart
      res.redirect('/shop');
    }
  });
};

// Renders history of purchases
exports.showHistory = function(req, res) {
  // Redirect to login if not logged in
  if (!Parse.User.current()) {
    res.redirect('/login');
    return;
  }

  var query = new Parse.Query(Purchase);
  query.find().then(function(purchases) {
    if (!purchases || purchases.length <= 0) {
      res.redirect('/shop');
    } else {
      res.render('history', { purchases : purchases });
    }
  }, function(error) {
    // Redirect back to shop if something went wrong
    res.redirect('/shop');
  });
};
