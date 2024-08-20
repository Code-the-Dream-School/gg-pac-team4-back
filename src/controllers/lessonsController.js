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

//create a new lesson
const createLesson = async (req, res) => {
  const createdBy = req.user.userId;
  const { studentId } = req.params;

  try {
    const { lessonTitle, lessonDescription, lessonSchedule, type } = req.body;

    const classInfo = await Class.findOne({
      createdBy,
      'classStudents.userId': studentId,
    });

    if (!classInfo) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'No class found with this student and teacher combination',
      });
    }

    const existingLesson = await Lesson.findOne({
      studentId,
      lessonTitle,
      lessonSchedule,
      type,
    });

    if (existingLesson) {
      throw new BadRequestError(
        'Lesson with this student, title, and schedule already exists.'
      );
    }

    const newLesson = new Lesson({
      lessonTitle,
      lessonDescription,
      type,
      lessonSchedule,
      createdBy,
      studentId,
      classId: classInfo._id,
    });

    const savedLesson = await newLesson.save();

    res
      .status(StatusCodes.CREATED)
      .json({ message: 'Lesson created successfully', lesson: savedLesson });
  } catch (error) {
    console.error('Error creating lesson:', error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: 'Internal server error' });
  }
};

module.exports = {
  displayStudentLessons,
  getLessonDetails,
  createLesson,
};
