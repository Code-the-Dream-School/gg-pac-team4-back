const mongoose = require('mongoose');
const { validateURL } = require('../utils/urlValidation');

const ClassSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    classTitle: {
      type: String,
      required: [true, 'Please provide your class title'],
      minlength: [2, 'Title must be at least 2 characters long'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide your class description'],
      minlength: [2, 'Description must be at least 2 characters long'],
      maxlength: [200, 'Description cannot exceed 200 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide the class price'],
      min: [0, 'Price must be at least 0'],
    },
    duration: {
      type: Number,
      required: [true, 'Please provide the class duration'],
      min: [0, 'Duration must be at least 0'],
    },
    ages: {
      minAge: {
        type: Number,
        required: [true, 'Please provide the minimum age'],
        min: [0, 'Minimum age must be at least 0'],
      },
      maxAge: {
        type: Number,
        required: [true, 'Please provide the maximum age'],
        min: [0, 'Maximum age must be at least 0'],
      },
    },
    type: {
      type: String,
      required: [true, 'Please provide the type of class'],
      enum: {
        values: ['online', 'offline'],
        message: 'Type must be either "online" or "offline"',
      },
    },
    lessonType: {
      type: String,
      required: [true, 'Please specify the lesson type'],
      enum: {
        values: ['Group', '1:1'],
        message: 'Lesson type must be either "Group" or "1:1"',
      },
    },
    goal: {
      type: String,
      maxlength: [200, 'Goal cannot exceed 200 characters'],
      default: '',
    },
    experience: {
      type: String,
      maxlength: [200, 'Experience cannot exceed 200 characters'],
      default: '',
    },
    other: {
      type: String,
      maxlength: [200, 'Other information cannot exceed 200 characters'],
      default: '',
    },
    availableTime: [
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
    classImageUrl: {
      type: String,
      default:
        'https://res.cloudinary.com/dn1ewxfy7/image/upload/v1722717323/2602291_dc5c66.jpg',
      validate: {
        validator: validateURL,
        message: 'Invalid URL format',
      },
    },
    classImagePublicId: {
      type: String,
      default: 'default_class_image',
    },
    likes: {
      type: Number,
      default: 0,
    },
    applications: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        appliedAt: {
          type: Date,
          default: Date.now,
        },
        date: {
          type: Date,
        },
        startTime: {
          type: String,
        },
      },
    ],
    classStudents: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        appliedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    category: {
      type: String,
      required: [true, 'Please provide the category of the class'],
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
    },
  },
  { timestamps: true }
);

const ClassModel = mongoose.model('Class', ClassSchema, 'Classes');

module.exports = ClassModel;
