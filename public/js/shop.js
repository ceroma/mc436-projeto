function dismissReminder() {
  var reminder = document.getElementById('reminder');
  if (reminder) {
    reminder.remove();
  }
  return false;
};

function addItem(button_element) {
  var input_field = getInputField(button_element);
  if (input_field.value < 99) {
    input_field.value++;
  }
  return false;
};

function removeItem(button_element) {
  var input_field = getInputField(button_element);
  if (input_field.value > 0) {
    input_field.value--
  }
  return false;
};

function getInputField(button_element) {
  var input_group = button_element.parentNode.parentNode;
  var input_field = input_group.getElementsByClassName('input-sm')[0];
  return input_field;
};

function setUpSpeechRecognition() {
  if (!('webkitSpeechRecognition' in window)) {
    return false;
  }

  var search_field = document.getElementsByName('q')[0];
  var microphone_icon = document.getElementsByClassName('microphone-icon')[0];

  var recognition = new webkitSpeechRecognition();
  recognition.onstart = function() {
    addClass(microphone_icon, 'recording');
  };
  recognition.onend = function() {
    removeClass(microphone_icon, 'recording');
  };
  recognition.onresult = function(results) {
    if (results.results && results.results[0] && results.results[0][0]) {
      search_field.value = results.results[0][0].transcript;
    }
  };

  microphone_icon.onclick = function() {
    recognition.start();
  };

  removeClass(microphone_icon, 'hidden');
  search_field.style.paddingRight = '44px';
  return false;
};

function addClass(element, class_name) {
  element.className = element.className + ' ' + class_name;
};

function removeClass(element, class_name) {
  element.className = element.className.replace(new RegExp(class_name), '');
};
