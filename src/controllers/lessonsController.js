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
const sendEmailNotification = require('../utils/sendEmailNotification');

//Display all one of my student lessons
const displayStudentLessons = async (req, res) => {
  const userId = req.user.userId;
  const userRole = req.user.role;
  const { studentId } = req.params;

  try {
    if (userRole === 'teacher') {
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
      // Fetch lessons created by this teacher for the specified student
      const lessons = await Lesson.find({
        createdBy: userId,
        studentId: studentId,
      });

      return res.status(StatusCodes.OK).json({
        lessons,
      });
    } else if (userRole === 'student') {
      // If the user is a student, ensure they are trying to view their own lessons
      if (userId !== studentId) {
        return res.status(StatusCodes.FORBIDDEN).json({
          message: 'You are not authorized to view these lessons.',
        });
      }

      // Fetch lessons for this student
      const lessons = await Lesson.find({
        studentId: userId,
      });

      return res.status(StatusCodes.OK).json({
        lessons,
      });
    } else {
      // If the user is neither a teacher nor a student, return a forbidden error
      return res.status(StatusCodes.FORBIDDEN).json({
        message: 'You are not authorized to view these lessons.',
      });
    }
  } catch (error) {
    console.error('Error retrieving lessons:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Internal server error',
    });
  }
};

//Display lesson details
const getLessonDetails = async (req, res) => {
  const userId = req.user.userId;
  const userRole = req.user.role;
  const { studentId, lessonId } = req.params;

  try {
    // Find the lesson by ID
    const lessonDetails = await Lesson.findById(lessonId);

    if (!lessonDetails) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'Lesson does not exist',
      });
    }

    if (userRole === 'teacher') {
      // Check if the user is the creator of the lesson
      if (lessonDetails.createdBy.toString() !== userId) {
        return res.status(StatusCodes.FORBIDDEN).json({
          message: 'You are not authorized to view these lesson details.',
        });
      }
    } else if (userRole === 'student') {
      // Check if the user is the student assigned to the lesson
      if (
        lessonDetails.studentId.toString() !== studentId ||
        studentId !== userId
      ) {
        return res.status(StatusCodes.FORBIDDEN).json({
          message: 'You are not authorized to view these lesson details.',
        });
      }
    } else {
      // If the user's role is neither teacher nor student, return forbidden
      return res.status(StatusCodes.FORBIDDEN).json({
        message: 'You are not authorized to view these lesson details.',
      });
    }

    res.status(StatusCodes.OK).json({ lesson: lessonDetails });
  } catch (error) {
    console.error('Error retrieving lesson details:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Internal server error',
    });
  }
};

//create a new lesson
const createLesson = async (req, res) => {
  const createdBy = req.user.userId;
  const userRole = req.user.role;
  const { studentId } = req.params;
  const {
    lessonTitle,
    lessonDescription,
    lessonSchedule,
    type,
    classId,
    hometask,
  } = req.body;

  if (userRole !== 'teacher') {
    return res.status(StatusCodes.FORBIDDEN).json({
      message: 'Only teachers can create lessons.',
    });
  }

  try {
    const classInfo = await Class.findOne({
      createdBy,
      'classStudents.userId': studentId,
      _id: classId,
    });

    if (!classInfo) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'No class found with this student and teacher combination',
      });
    }

    // Check if a lesson with the same classId, studentId, lessonTitle, and lessonSchedule already exists
    const existingLesson = await Lesson.findOne({
      studentId,
      lessonTitle,
      lessonSchedule,
      classId,
      type,
    });

    if (existingLesson) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message:
          'Lesson with this student, title, schedule, and class already exists.',
      });
    }

    const newLesson = new Lesson({
      lessonTitle,
      lessonDescription,
      type,
      lessonSchedule,
      createdBy,
      studentId,
      classId,
      hometask,
    });

    // Find student
    const student = await Student.findById(newLesson.studentId);
    if (!student) {
      throw new NotFoundError('Student not found');
    }

    global.io.emit(`newLesson-${newLesson.studentId}`, {
      content: `You have a new lesson for the class: ${classInfo.classTitle}. Please check your Lessons for more information.`,
    });

    // Send email
    const emailMessage = `You have a new lesson for the class: ${classInfo.classTitle}. Please check your Lessons for more information.`;

    await sendEmailNotification({
      to: student.email,
      subject: 'New lesson',
      text: emailMessage,
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

//Edit lesson
const editLesson = async (req, res) => {
  const userId = req.user.userId;
  const userRole = req.user.role;
  const { lessonId } = req.params;

  if (userRole !== 'teacher') {
    return res.status(StatusCodes.FORBIDDEN).json({
      message: 'Only teachers can edit lessons.',
    });
  }
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

    // Find student
    const student = await Student.findById(updatedLesson.studentId);
    if (!student) {
      throw new NotFoundError('Student not found');
    }

    global.io.emit(`editLesson-${updatedLesson.studentId}`, {
      content: `The teacher made changes to your lesson: ${updatedLesson.lessonTitle}. Please check your Lessons for more information.`,
    });

    // Send email
    const emailMessage = `The teacher made changes to your lesson: ${updatedLesson.lessonTitle}. Please check your Lessons for more information.`;

    await sendEmailNotification({
      to: student.email,
      subject: 'Lesson changes',
      text: emailMessage,
    });

    res.status(StatusCodes.OK).json({ lesson: updatedLesson });
  } catch (error) {
    console.error('Error editing lesson:', error);
    const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    const errorMessage = error.message || 'Internal server error';
    res.status(statusCode).json({ message: errorMessage });
  }
};

//delete lesson
const deleteLesson = async (req, res) => {
  const { lessonId, studentId } = req.params;
  const userRole = req.user.role;
  const userId = req.user.userId;

  if (userRole !== 'teacher') {
    return res.status(StatusCodes.FORBIDDEN).json({
      message: 'Only teachers can delete lessons.',
    });
  }
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

    // Find student
    const student = await Student.findById(lessonToDelete.studentId);
    if (!student) {
      throw new NotFoundError('Student not found');
    }

    global.io.emit(`deleteLesson-${lessonToDelete.studentId}`, {
      content: `The teacher canceled your lesson: ${lessonToDelete.lessonTitle}.`,
    });

    // Send email
    const emailMessage = `The teacher canceled your lesson: ${lessonToDelete.lessonTitle}.`;

    await sendEmailNotification({
      to: student.email,
      subject: 'Lesson canceled',
      text: emailMessage,
    });

    // Remove the lesson from the student's myLessons array
    await Student.findByIdAndUpdate(
      studentId,
      { $pull: { myLessons: lessonId } },
      { new: true }
    );

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
