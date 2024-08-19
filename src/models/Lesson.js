const mongoose = require('mongoose');
const Class = require('./Class');

const LessonSchema = new mongoose.Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
  },
  lessonTitle: {
    type: String,
    required: [true, 'Please provide lesson title'],
    default: '',
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Please add your student'],
    ref: 'User',
  },
  lessonSchedule: {
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
  lessonDescription: {
    type: String,
    default: '',
  },
  hometask: {
    type: String,
    default: '',
  },
  lessonFiles: {
    url: {
      type: String,
      default: '',
    },
    publicId: {
      type: String,
      default: 'default_lesson_file',
    },
  },
});

const LessonModel = mongoose.model('Lesson', LessonSchema, 'Lessons');

module.exports = LessonModel;
