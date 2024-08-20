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
    const teacher = await Teacher.findById(userId);

    if (!teacher) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'Teacher not found',
      });
    }

    // Check if the teacher has any students
    if (teacher.myStudents.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "Sorry, you don't have any students.",
      });
    }

    // Check if the student is in the `myStudents` array of the teacher
    if (!teacher.myStudents.includes(studentId)) {
      return res.status(StatusCodes.FORBIDDEN).json({
        message: 'The student is not listed under your students.',
      });
    }

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
    const studentId = await Teacher.findById(myStudents);
    throw new NotFoundError('Lesson does not exist');
    if (!studentId) {
    }

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

    // Update student's myLessons with the new class ID
    await Student.findByIdAndUpdate(
      studentId,
      { $push: { myLessons: savedLesson._id } },
      { new: true } // Return the updated document
    );

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

const editLesson = async (req, res) => {
  const userId = req.user.userId;
  const { lessonId } = req.params;
  try {
    const lessonToEdit = await Lesson.findById(lessonId);

    if (!lessonToEdit) {
      throw new NotFoundError('Lesson does not exist');
    }

    if (
      !lessonToEdit.createdBy ||
      lessonToEdit.createdBy.toString() !== userId
    ) {
      throw new ForbiddenError(
        'You do not have permission to edit this lesson.'
      );
    }

    const updateData = {};

    Object.entries(req.body).forEach(([key, value]) => {
      if (key !== 'lessons') {
        updateData[key] = value;
      }
    });

    const updatedLesson = await Lesson.findByIdAndUpdate(
      lessonId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.status(StatusCodes.OK).json({ lesson: updatedLesson });
  } catch (error) {
    console.error('Error editing lesson:', error);
    const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    const errorMessage = error.message || 'Internal server error';
    res.status(statusCode).json({ message: errorMessage });
  }
};

const deleteLesson = async (req, res) => {
  const { lessonId } = req.params;
  const userId = req.user.userId;
  try {
    const lessonToDelete = await Lesson.findById(lessonId);

    if (!lessonToDelete) {
      throw new NotFoundError('Lesson does not exist');
    }

    if (
      !lessonToDelete.createdBy ||
      lessonToDelete.createdBy.toString() !== userId
    ) {
      throw new ForbiddenError(
        'You do not have permission to delete this lesson'
      );
    }

    await Lesson.findByIdAndDelete(lessonId);

    res.status(StatusCodes.OK).json({ message: 'Lesson successfully deleted' });
  } catch (error) {
    console.error('Error deleting lesson:', error);
    const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    const errorMessage = error.message || 'Internal server error';
    res.status(statusCode).json({ message: errorMessage });
  }
};

module.exports = {
  displayStudentLessons,
  getLessonDetails,
  createLesson,
  editLesson,
  deleteLesson,
};
