// Renders Update Info Screen
exports.index = function(req, res) {
  // Redirect to login if not logged in
  if (!Parse.User.current()) {
    res.redirect('/login');
    return;
  }

  Parse.User.current().fetch().then(function(user) {
    var email = user.get('email');
    var address = user.get('address');

    // If user has these informations, send back to shop
    if (isEmailValid(email) && isAddressValid(address)) {
      res.redirect('/shop');
    } else {
      res.render('update', { user : user, show_alert : req.query.cart });
    }
  }, function(error) {
    // Redirect back to shop if something went wrong
    res.redirect('/shop');
  });
};

// Updates User Info
exports.updateInfo = function(req, res) {
  // Redirect to login if not logged in
  if (!Parse.User.current()) {
    res.redirect('/login');
    return;
  }

  var new_email = req.body.email && req.body.email.trim();
  var new_address = req.body.address && req.body.address.trim();
  if (!isEmailValid(new_email) && !isAddressValid(new_address)) {
    res.redirect('/update');
    return;
  }

  Parse.User.current().fetch().then(function(user) {
    if (isEmailValid(new_email)) {
      user.set('email', new_email);
    }

    if (isAddressValid(new_address)) {
      user.set('address', new_address);
    }

    return user.save();

  }).then(function(user) {
    // Redirect user back to cart, if one exists
    if (user.get('lastCart')) {
      res.redirect('/cart/' + user.get('lastCart').id + '/buy');
    } else {
      res.redirect('/shop');
    }
  }, function(error) {
    // Redirect back to shop if something went wrong
    res.redirect('/shop');
  });
};

// Validates email
function isEmailValid(email) {
  return email && email.length >= 5;
};

// Validates address
function isAddressValid(address) {
  return address && address.length >= 10;
};
