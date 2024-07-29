const lettersOnlyValidator = {
    validator: function(value) {
      return /^[A-Za-z]+$/.test(value);
    },
    message: props => `${props.path} should contain only letters`
  };
  module.exports = {lettersOnlyValidator };