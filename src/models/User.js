const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { lettersOnlyValidator } = require('../utils/letterValidation.js');
const { validateURL } = require('../utils/urlValidation.js');

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'Please provide a first name'],
      minlength: [2, 'First name must be at least 2 characters'],
      maxlength: [50, 'First name must be at most 50 characters'],
      validate: lettersOnlyValidator,
    },
    lastName: {
      type: String,
      required: [true, 'Please provide a last name'],
      minlength: [2, 'Last name must be at least 2 characters'],
      maxlength: [50, 'Last name must be at most 50 characters'],
      validate: lettersOnlyValidator,
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
    profileImageUrl: {
      type: String,
      default:
        'https://res.cloudinary.com/dn1ewxfy7/image/upload/v1722717323/55055_eqqnfd.jpg',
      validate: {
        validator: validateURL,
        message: 'Invalid URL format',
      },
    },
    role: {
      type: String,
      enum: ['student', 'teacher'],
      required: true,
    },
    profileImagePublicId: {
      type: String,
      default: 'default_profile_image',
    },
    aboutMe: {
      type: String,
      maxlength: [1000, 'About me must be at most 500 characters'],
      default: '',
    },
    notifications: [
      {
        message: {
          type: String,
          required: true,
        },
        date: {
          type: Date,
          default: Date.now,
        },
        read: {
          type: Boolean,
          default: false,
        },
      },
    ],
    messages: [
      {
        sender: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    subjectArea: {
      type: [String],
      enum: [
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
      default: [],
    },
  },
  { discriminatorKey: 'role', timestamps: true }
);

// Before saving the users, hash the password, check the role and remove the field if it should not be set
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

const User = mongoose.model('User', UserSchema);

module.exports = User;
