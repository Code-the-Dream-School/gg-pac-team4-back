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
    default: '',
    match: [
      /^(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{1,4}\)?[-.\s]?)?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/,
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
  profileVideoUrl: {
    type: String,
    default: '',
  },
  profileVideoPublicId: {
    type: String,
    default: 'default_profile_video',
  },
  profilePortfolioImages: [
    {
      url: {
        type: String,
        default: '',
      },
      publicId: {
        type: String,
        default: 'default_portfolio_image',
      },
    },
  ],
  profilePortfolioVideos: [
    {
      url: {
        type: String,
        default: '',
      },
      publicId: {
        type: String,
        default: 'default_portfolio_video',
      },
    },
  ],
  aboutMe: {
    type: String,
    maxlength: 500,
    default: '',
  },
  education: {
    type: String,
    default: '',
  },
  experience: {
    type: String,
    default: '',
  },
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
  hourlyRate: {
    type: Number,
    required: function () {
      return this.role === 'teacher' && this.isModified('hourlyRate');
    },
  },
  availability: {
    type: String,
    required: function () {
      return this.role === 'teacher' && this.isModified('availability');
    },
  },
  myClasses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
    },
  ],
  myStudents: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  myTeachers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
});

UserSchema.virtual('filteredUser').get(function () {
  const user = this.toObject();

  // Remove fields for non-teachers
  if (user.role !== 'teacher') {
    delete user.education;
    delete user.experience;
    delete user.myClasses;
    delete user.profilePortfolioVideos;
    delete user.profilePortfolioImages;
    delete user.profileVideoUrl;
    delete user.profileVideoPublicId;
    delete user.myStudents;
  }

  if (user.role !== 'student') {
    delete user.myTeachers;
  }

  // Remove sensitive information
  delete user.password;

  return user;
});

// Before saving the users, hash the password, check the role and remove the field if it should not be set
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  this.passwordChangedAt = Date.now() - 1000; // Password changed 1 second ago

  if (this.isNew || this.isModified()) {
    if (this.role !== 'teacher') {
      this.education = undefined;
      this.experience = undefined;
      this.myClasses = undefined;
      this.profilePortfolioVideos = undefined;
      this.profilePortfolioImages = undefined;
      this.profileVideoUrl = undefined;
      this.profileVideoPublicId = undefined;
      this.myStudents = undefined;
    }
    if (this.role !== 'student') {
      this.myTeachers = undefined;
    }
  }
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
