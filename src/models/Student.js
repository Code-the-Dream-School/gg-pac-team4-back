const mongoose = require('mongoose');
const User = require('./User');
const {
  adultValidator,
  adultNameFirstAndLast,
} = require('../utils/adultValidation');
const { lettersOnlyValidator } = require('../utils/letterValidation.js');

const StudentSchema = new mongoose.Schema({
  adultName: {
    type: String,
    validate: [lettersOnlyValidator, ...adultValidator, adultNameFirstAndLast],
  },
  phoneNumber: {
    type: String,
    default: '',
    match: [
      /^(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{1,4}\)?[-.\s]?)?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/,
      'Please provide a valid phone number',
    ],
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  myClasses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      default: [],
    },
  ],
  myTeachers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      default: [],
    },
  ],
  myLessons: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      default: [],
    },
  ],
});

module.exports = User.discriminator('Student', StudentSchema);
