const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "Please provide your first name"],
    minlength: [2, "First name must be at least 2 characters long"],
    maxlength: [30, "First name cannot exceed 30 characters"],
  },
  lastName: {
    type: String,
    required: [true, "Please provide your last name"],
    minlength: [1, "Last name must be at least 1 character long"],
    maxlength: [30, "Last name must be no more than 30 characters long"],
  },
  email: {
    type: String,
    required: [true, "Please provide email"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please provide password"],
    minlength: 6,
  },
});

const UserModel = mongoose.model("User", UserSchema, "Users");

module.exports = UserModel;