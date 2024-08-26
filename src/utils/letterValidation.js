const lettersOnlyValidator = {
  validator: function (value) {
    return /^[A-Za-z\s]+$/.test(value);
  },
  message: (props) => `${props.path} should contain only letters`,
};
module.exports = { lettersOnlyValidator };
