const mongoose = require('mongoose');
const User = require('./User');

const TeacherSchema = new mongoose.Schema({
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
    },
  ],
  myClasses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
    },
  ],
  mySchedule: [
    {
      day: {
        type: String,
        required: true,
      },
      time: {
        type: String,
        required: true,
      },
    },
  ],
});

module.exports = User.discriminator('Teacher', TeacherSchema);
