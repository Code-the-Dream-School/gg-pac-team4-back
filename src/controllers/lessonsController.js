const Lesson = require('../models/Lesson');
const Class = require('../models/Class');
const User = require('../models/User');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const { StatusCodes } = require('http-status-codes');
const {
  BadRequestError,
  NotFoundError,
  UnauthenticatedError,
} = require('../errors');
const ForbiddenError = require('../errors/forbidden');

//Display all one of my student lessons
const displayStudentLessons = async (req, res) => {
  const userId = req.user.userId;
  const { studentId } = req.params;

  try {
    const lessons = await Lesson.find({
      createdBy: userId,
      studentId: studentId,
    });

    res.status(StatusCodes.OK).json({
      lessons,
    });
  } catch (error) {
    console.error('Error retrieving lessons:', error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: 'Internal server error' });
  }
};

//Display lesson details
const getLessonDetails = async (req, res) => {
  const userId = req.user.userId;
  const { studentId, lessonId } = req.params;
  try {
    const lessonDetails = await Lesson.findById(lessonId);

    if (!lessonDetails) {
      throw new NotFoundError('Lesson does not exist');
    }

    res.status(StatusCodes.OK).json({ lesson: lessonDetails });
  } catch (error) {
    console.error('Error retrieving lesson details:', error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: 'Internal server error' });
  }
};

module.exports = {
  displayStudentLessons,
  getLessonDetails,
};
