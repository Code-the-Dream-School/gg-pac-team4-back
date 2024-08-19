const mongoose = require('mongoose');

const LessonSchema = new mongoose.Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  lessonTitle: {
    type: String,
    required: [true, 'Please provide lesson title'],
    default: function () {
      return `Lesson 1: Welcome to ${this.className}`;
    },
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Please add your student'],
    ref: 'User',
  },
  lessonSchedule: [
    {
      date: {
        type: Date,
        required: [true, 'Please provide the date'],
      },
      startTime: {
        type: String,
        required: [true, 'Please provide the start time'],
        default: '',
      },
    },
  ],
  lessonDescription: {
    type: String,
    default: '',
  },
  hometask: {
    type: String,
    default: '',
  },
  lessonFiles: {
    type: String,
    default:
      'https://res.cloudinary.com/dn1ewxfy7/image/upload/v1722717323/2602291_dc5c66.jpg',
    validate: {
      validator: validateURL,
      message: 'Invalid URL format',
    },
  },
});

const LessonModel = mongoose.model('Lesson', LessonSchema, 'Lessons');

module.exports = LessonModel;
