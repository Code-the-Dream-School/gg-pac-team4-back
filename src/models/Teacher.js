const mongoose = require('mongoose');
const User = require('./User');

const TeacherSchema = new mongoose.Schema(
  {
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
    education: {
      type: String,
      default: '',
    },
    experience: {
      type: String,
      default: '',
    },
    myStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        default: [],
      },
    ],
    myClasses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        default: [],
      },
    ],
    mySchedule: [
      {
        day: {
          type: String,
          required: true,
          default: '',
        },
        time: {
          type: String,
          required: true,
          default: '',
        },
      },
    ],
  },
  { discriminatorKey: 'role' }
);

const Teacher = User.discriminator('Teacher', TeacherSchema);

module.exports = Teacher;
