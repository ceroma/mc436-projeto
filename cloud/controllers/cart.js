var Cart = Parse.Object.extend('Cart', {
  canShow: function() {
    // If user bought this cart, can see it again
    if (this.get('purchase')) {
      return true;
    }

    // Can't see cart after 1h without buying it
    var one_hour_in_ms = 60 * 60 * 1000;
    var now = (new Date()).getTime();
    var creation_time = (new Date(this.createdAt)).getTime();
    return (now - creation_time) < one_hour_in_ms;
  }
});
var Product = Parse.Object.extend('Product');

// Renders a given cart
exports.show = function(req, res) {
  // Redirect to login if not logged in
  if (!Parse.User.current()) {
    res.redirect('/login');
    return;
  }

  var cart_id = req.params.id;

  var current_cart;
  var query = new Parse.Query(Cart);
  query.get(cart_id).then(function(cart) {
    current_cart = cart;

    // First check whether user can see cart
    if (!cart.canShow()) {
      return Parse.Promise.error();
    }

    // Then fetch purchase data, if existent
    if (cart.get('purchase')) {
      return cart.get('purchase').fetch();
    } else {
      return Parse.Promise.as();
    }

  }).then(function(purchase) {
    // Now fetch the products in this cart
    var query = new Parse.Query(Product);
    query.containedIn('objectId', current_cart.get('products'));
    return query.find();

  }).then(function(products) {
    // Prepare rendering data
    var product_to_name = {};
    var product_to_source = {};
    products.forEach(function(product) {
      product_to_name[product.id] = product.get('name');
      product_to_source[product.id] = product.get('imageSrc');
    });
    var products_data = [];
    for (var i = 0; i < current_cart.get('products').length; i++) {
      products_data.push({
        quantity : current_cart.get('quantities')[i],
        pricePerUnit : current_cart.get('pricesPerUnit')[i],
        name : product_to_name[current_cart.get('products')[i]],
        imageSrc : product_to_source[current_cart.get('products')[i]]
      });
    }

    res.render('cart', {
      cart_id : current_cart.id,
      moment : require('moment'),
      products : products_data,
      purchase : current_cart.get('purchase'),
    });
  }, function(error) {
    // Redirect back to shop if user can't see this cart
    res.redirect('/shop');
  });
};

// Creates a new cart
exports.create = function(req, res) {
  // Redirect to login if not logged in
  if (!Parse.User.current()) {
    res.redirect('/login');
    return;
  }

  var products = req.body.products;
  var quantities = req.body.quantities;

  // Filter only the non-zero products
  var non_zero_ids = [];
  var product_to_quantity = {};
  for (var i = 0; i < quantities.length; i++) {
    if (quantities[i] > 0) {
      non_zero_ids.push(products[i]);
      product_to_quantity[products[i]] = quantities[i];
    }
  }

  // Sanity check that user is trying to buy something
  if (non_zero_ids.length <= 0) {
    res.redirect('/shop');
    return;
  }

  // Now we're going to:
  // 1. Remove user's current lastCart
  // 2. Create the new cart
  // 3. Save it as the new lastCart
  var current_user;
  Parse.User.current().fetch().then(function(user) {
    // Fetch last cart, if it exists
    current_user = user;
    var last_cart = user.get('lastCart');
    if (last_cart) {
      return last_cart.fetch();
    } else {
      return Parse.Promise.as();
    }

  }).then(function(last_cart) {
    // Destroy it, if it exists
    if (last_cart) {
      return last_cart.destroy();
    } else {
      return Parse.Promise.as();
    }

  }).then(function() {
    // Fetch the wanted products to get their prices
    var query = new Parse.Query(Product);
    query.containedIn('objectId', non_zero_ids);
    return query.find();

  }).then(function(objects) {
    // Create new cart with desired products
    var new_cart = new Cart();
    objects.forEach(function(product) {
      new_cart.add('products', product.id);
      new_cart.add('pricesPerUnit', product.get('price'));
      new_cart.add('quantities', product_to_quantity[product.id]);
    });

    // Make sure only user can see his/her cart!!
    new_cart.setACL(new Parse.ACL(current_user));

    // Save new cart to user's lastCart
    current_user.set('lastCart', new_cart);
    return current_user.save();

  }).then(function(user) {
    res.redirect('/cart/' + current_user.get('lastCart').id);
  }, function(error) {
    res.send(500, 'Failed creating new cart');
  });
};
