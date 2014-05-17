var Buffer = require('buffer').Buffer;
var crypto = require('crypto');

// Fields to be passed to <fb:registration />
var FORM_FIELDS = JSON.stringify(
  [
    {'name': 'name'},
    {'name': 'email'},
    {'name': 'password'},
    {'name': 'captcha'}
  ]
).replace(/\"/g, "'");

// Renders Sign Up Screen
exports.index = function(req, res) {
  res.render('signup', { form_fields : FORM_FIELDS });
};

// Creates New User
exports.createNewUser = function(req, res) {
  // Parse signed request
  var registration_data = getRegistrationData(req.body.signed_request);
  if (!registration_data) {
    res.redirect('/signup');
    return;
  }

  var new_user = new Parse.User();
  new_user.set("name", registration_data.name);
  new_user.set("email", registration_data.email);
  new_user.set("username", registration_data.email);
  new_user.set("password", registration_data.password);

  // Create new user
  new_user.signUp(null, {
    success: function(user) {
      // Say hello to new user
      res.redirect('/');
    },
    error: function(user, error) {
      // Redirect back to Sign Up form
      res.redirect('/signup');
    }
  });
};

// Parses the signed request received from Facebook and returns the actual
// form data if all security checks pass, otherwise returns null.
function getRegistrationData(signed_request) {
  var request_data = signed_request.split('.', 2);
  var encoded_payload = request_data[1];
  var encoded_signature = request_data[0];

  if (!isFacebookSignatureValid(encoded_signature, encoded_payload)) {
    return null
  }

  // Decode payload
  var payload = JSON.parse(new Buffer(encoded_payload, 'base64'));
  if (!isFacebookPayloadValid(payload)) {
    return null;
  }

  return payload.registration;
};

// Validates request signature
function isFacebookSignatureValid(encoded_signature, encoded_payload) {
  var secret = 'FACEBOOK_APP_SECRET';
  var hmac = crypto.createHmac('sha256', secret);
  var expected_signature =
    hmac.update(encoded_payload).digest('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace('=', '');
  return encoded_signature == expected_signature;
};

// Validates registration data
function isFacebookPayloadValid(payload) {
  if (!payload || !payload.registration) {
    return false;
  }

  if (payload.algorithm != 'HMAC-SHA256') {
    return false;
  }

  if (!payload.registration_metadata ||
      FORM_FIELDS != payload.registration_metadata.fields) {
    return false;
  }

  return true;
};
