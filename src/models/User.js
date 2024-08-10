const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const {
  adultValidator,
  adultNameFirstAndLast,
} = require('../utils/adultValidation');
const { lettersOnlyValidator } = require('../utils/letterValidation.js');
const { validateURL } = require('../utils/urlValidation.js');

// Define the Users schema
const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Please provide a first name'],
    minlength: 2,
    maxlength: 50,
    validate: lettersOnlyValidator,
  },
  lastName: {
    type: String,
    required: [true, 'Please provide a last name'],
    minlength: 2,
    maxlength: 50,
    validate: lettersOnlyValidator,
  },
  dateOfBirth: {
    type: Date,
    required: function () {
      return this.role === 'student';
    }, // Required only for students
  },
  adultName: {
    type: String,
    validate: [
      lettersOnlyValidator,
      ...adultValidator, // Spread operator is used to include multiple validators
      adultNameFirstAndLast,
    ],
  },
  phoneNumber: {
    type: String,
    match: [
      /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/,
      'Please provide a valid phone number',
    ],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please provide a valid email',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
  },
  passwordChangedAt: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,

  role: {
    type: String,
    enum: ['student', 'teacher'],
    required: true,
  },
  subject: {
    type: String,
    validate: lettersOnlyValidator,
  },
  profileImageUrl: {
    type: String,
    default:
      'https://res.cloudinary.com/dn1ewxfy7/image/upload/v1722717323/55055_eqqnfd.jpg',
    validate: {
      validator: validateURL,
      message: 'Invalid URL format',
    },
  },
  profileImagePublicId: {
    type: String,
    default: 'default_profile_image',
  },
  specialty: {
    type: [String],
    enum: {
      values: [
        'Music',
        'Arts',
        'Dance',
        'Photography',
        'Film Production',
        'Design',
        'Acting Skills',
        'Storytelling',
        'Ceramics & Sculpture',
        'Handicrafts',
        '3D & Animation',
        'Games & Hobbies',
      ],
    },
    required: function () {
      return this.role === 'teacher';
    },
    select: false,
  },
  education: {
    type: String,
    maxlength: [200, 'Education cannot exceed 200 characters'],
    default: '',
    required: function () {
      return this.role === 'teacher';
    },
    select: false,
  },
  aboutUser: {
    type: String,
    maxlength: [300, 'About cannot exceed 300 characters'],
    default: '',
  },
  interestStudent: {
    type: String,
    maxlength: [200, 'Interests cannot exceed 200 characters'],
    default: '',
    required: function () {
      return this.role === 'student';
    },
    select: false,
  },
});

// Before saving the users, hash the password
//pre('save') hook. The password hashing is consistently applied anytime a document is saved
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  this.passwordChangedAt = Date.now() - 1000; // Password changed 1 second ago
  next();
});

// Compare password
UserSchema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
};

// Check if the reset password token has expired
UserSchema.methods.isResetPasswordTokenExpired = function () {
  return this.resetPasswordExpires && this.resetPasswordExpires < Date.now();
};

// Check if the password was changed after the token was issued
UserSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false; // False means NOT changed
};
module.exports = mongoose.model('User', UserSchema);
