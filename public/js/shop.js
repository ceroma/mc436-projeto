function dismissReminder() {
  var reminder = document.getElementById('reminder');
  if (reminder) {
    reminder.remove();
  }
  return false;
}

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
