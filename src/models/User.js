const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { adultValidator, adultNameFirstAndLast } = require('../utils/adultValidation');
const {lettersOnlyValidator}= require("../utils/letterValidation.js");

// Define the Users schema
const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Please provide a first name'],
    minlength: 2,
    maxlength: 50,
    validate: lettersOnlyValidator
  },
  lastName: {
    type: String,
    required: [true, 'Please provide a last name'],
    minlength: 2,
    maxlength: 50,
    validate: lettersOnlyValidator
  },
  dateOfBirth: {
    type: Date,
    required: function() { return this.role === 'student'; } // Required only for students
  },
  adultName: {
    type: String,   
    validate: [
      lettersOnlyValidator,
      ...adultValidator, // Spread operator is used to include multiple validators
      adultNameFirstAndLast
    ]
  },
  phoneNumber: {
    type: String,    
    match: [
      /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/,
      'Please provide a valid phone number'
    ]
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6
  },
  role: {
    type: String,
    enum: ['student', 'teacher'],
    required: true
  },
  subject: { 
    type: String, 
    validate: lettersOnlyValidator   
  } 
});

// Before saving the users, hash the password
//pre('save') hook. The password hashing is consistently applied anytime a document is saved
UsersSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare the provided password with the users' password
UsersSchema.methods.comparePassword = async function(candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
};

module.exports = mongoose.model('User', UserSchema);