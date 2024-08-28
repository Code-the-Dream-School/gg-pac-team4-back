const cloudinary = require('cloudinary').v2;
const fs = require('fs').promises;
const Class = require('../models/Class');
const User = require('../models/User');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const Lesson = require('../models/Lesson');
const { StatusCodes } = require('http-status-codes');
const {
  BadRequestError,
  NotFoundError,
  UnauthenticatedError,
} = require('../errors');
const ForbiddenError = require('../errors/forbidden');

// Search for classes
const displaySearchClasses = async (req, res) => {
  let { page, limit, search, sortBy, sortOrder } = req.query;

  page = Number(page) || 1;
  limit = Number(limit) || 5;
  const skip = (page - 1) * limit;

  sortBy = sortBy || 'classTitle';
  sortOrder = sortOrder === 'desc' ? -1 : 1;

  const searchRegex = search ? new RegExp(search, 'i') : {};

  try {
    let query = {};

    if (search) {
      query = {
        $or: [
          { classTitle: searchRegex },
          { category: searchRegex },
          { description: searchRegex },
        ],
      };

      const classes = await Class.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ [sortBy]: sortOrder });

      const total = await Class.countDocuments(query);

      res.status(StatusCodes.OK).json({
        classes,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      });
    } else {
      const classes = await Class.find().sort({ [sortBy]: sortOrder });

      res.status(StatusCodes.OK).json({
        classes,
        total: classes.length,
        totalPages: 1,
        currentPage: 1,
      });
    }
  } catch (error) {
    console.error('Error retrieving classes:', error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: 'Internal server error' });
  }
};

//Class Details, display only after login
const getClassDetails = async (req, res) => {
  const { classId } = req.params;

  try {
    const classDetail = await Class.findById(classId);

    if (!classDetail) {
      throw new NotFoundError('Class does not exist');
    }

    res.status(StatusCodes.OK).json({ class: classDetail });
  } catch (error) {
    console.error('Error retrieving class details:', error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: 'Internal server error' });
  }
};

//Create a class, only after login
const createClass = async (req, res) => {
  const createdBy = req.user.userId;

  try {
    const {
      category,
      classTitle,
      description,
      price,
      duration,
      ages,
      type,
      goal,
      experience,
      other,
      availableTime,
      lessonType,
    } = req.body;

    const existingClass = await Class.findOne({
      classTitle,
      description,
      category,
      price,
      duration,
    });
    if (existingClass) {
      throw new BadRequestError(
        'Class with this title and description already exists.'
      );
    }

    let classImageUrl;
    let classImagePublicId;

    if (req.file) {
      try {
        const filePath = req.file.path;
        const classImageResponse = await cloudinary.uploader.upload(filePath);
        await fs.unlink(filePath); // Remove the file from local storage
        classImageUrl = classImageResponse.secure_url;
        classImagePublicId = classImageResponse.public_id;
      } catch (error) {
        return res
          .status(500)
          .json({ message: 'Failed to upload image', error: error.message });
      }
    }

    const newClass = new Class({
      category,
      classTitle,
      description,
      price,
      duration,
      ages,
      type,
      goal,
      experience,
      other,
      availableTime,
      createdBy,
      classImageUrl,
      classImagePublicId,
      lessonType,
    });

    // Save the new class and get the savedClass object
    const savedClass = await newClass.save();

    // Update user's myClasses with the new class ID
    await Teacher.findByIdAndUpdate(
      createdBy,
      { $push: { myClasses: savedClass._id } },
      { new: true } // Return the updated document
    );

    res
      .status(StatusCodes.CREATED)
      .json({ message: 'Class created successfully' });
  } catch (error) {
    console.error('Error creating class:', error);
    const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    const errorMessage = error.message || 'Error creating class';
    res.status(statusCode).json({ error: errorMessage });
  }
};

//Edit class, only after login and if you are creator
const editClass = async (req, res) => {
  const { classId } = req.params;
  const userId = req.user.userId;
  try {
    const classToEdit = await Class.findById(classId);

    if (!classToEdit) {
      throw new NotFoundError('Class does not exist');
    }

    if (!classToEdit.createdBy || classToEdit.createdBy.toString() !== userId) {
      throw new ForbiddenError(
        'You do not have permission to edit this class.'
      );
    }

    const updateData = {};

    if (req.file) {
      try {
        // Deleting the old image from Cloudinary if it exists
        if (
          classToEdit.classImagePublicId &&
          classToEdit.classImagePublicId !== 'default_class_image'
        ) {
          await cloudinary.uploader.destroy(classToEdit.classImagePublicId);
        }

        // Uploading new image to Cloudinary
        const filePath = req.file.path;
        const classImageResponse = await cloudinary.uploader.upload(filePath);
        await fs.unlink(filePath); // Cleaning up the temporary file

        // Updating image fields
        updateData.classImageUrl = classImageResponse.secure_url;
        updateData.classImagePublicId = classImageResponse.public_id;
      } catch (error) {
        return res.status(500).json({
          message: 'Failed to upload class image',
          error: error.message,
        });
      }
    }

    Object.entries(req.body).forEach(([key, value]) => {
      if (key !== 'classes') {
        updateData[key] = value;
      }
    });

    const updatedClass = await Class.findByIdAndUpdate(
      classId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.status(StatusCodes.OK).json({ class: updatedClass });
  } catch (error) {
    console.error('Error editing class:', error);
    const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    const errorMessage = error.message || 'Internal server error';
    res.status(statusCode).json({ message: errorMessage });
  }
};

//Delete a class, only after login and if you are creator
const deleteClass = async (req, res) => {
  const { classId } = req.params;
  const userId = req.user.userId;
  try {
    const classToDelete = await Class.findById(classId);

    if (!classToDelete) {
      throw new NotFoundError('Class does not exist');
    }

    if (
      !classToDelete.createdBy ||
      classToDelete.createdBy.toString() !== userId
    ) {
      throw new ForbiddenError(
        'You do not have permission to delete this class'
      );
    }
    if (classToDelete.classImagePublicId !== 'default_class_image') {
      await cloudinary.uploader.destroy(classToDelete.classImagePublicId);
    }

    // Remove the class from the creator's myClasses array
    await Teacher.findByIdAndUpdate(
      userId,
      { $pull: { myClasses: classId } },
      { new: true }
    );

    await Class.findByIdAndDelete(classId);

    res.status(StatusCodes.OK).json({ message: 'Class successfully deleted' });
  } catch (error) {
    console.error('Error deleting class:', error);
    const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    const errorMessage = error.message || 'Internal server error';
    res.status(statusCode).json({ message: errorMessage });
  }
};

//apply for class

const applyForClass = async (req, res) => {
  const { classId } = req.params;
  const userId = req.user.userId;
  const role = req.user.role;
  const { availableTimeId } = req.body;

  if (role !== 'student') {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: 'To apply for this class, you need to login as a student.',
    });
  }

  try {
    const classToApply = await Class.findById(classId);

    if (!classToApply) {
      throw new NotFoundError('Class does not exist');
    }

    const hasApplied = classToApply.applications.some(
      (applications) => applications.userId.toString() === userId.toString()
    );

    if (hasApplied) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: 'You have already applied for this class.' });
    }

    const availableTimeSlot = classToApply.availableTime.id(availableTimeId);

    if (!availableTimeSlot) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: 'Invalid time slot ID.' });
    }

    const date = availableTimeSlot.date;
    const startTime = availableTimeSlot.startTime;

    // Store the entire availableTimeSlot object in the applications array
    classToApply.applications.push({
      userId,
      date,
      startTime,
    });
    if (classToApply.lessonType === '1:1') {
      // Remove the time slot from availableTime after applying
      await Class.findByIdAndUpdate(
        classId,
        { $pull: { availableTime: { _id: availableTimeId } } },
        { new: true }
      );
    }

    await classToApply.save();

    global.io.emit(`applications-${classToApply.createdBy}`, {
      content: `You have a new application for the class: ${classToApply.classTitle}. Please check your notifications for more information.`,
    });

    const successMessage =
      classToApply.lessonType === '1:1'
        ? 'You have successfully applied for the one-on-one class.'
        : 'You have successfully applied for the group class.';

    return res.status(StatusCodes.OK).json({
      message: successMessage,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: 'An error occurred while applying for the class.' });
  }
};

const approveApplication = async (req, res) => {
  const { classId, applicationId } = req.params;
  const userId = req.user.userId;

  try {
    const applicationToApprove = await Class.findById(classId);

    if (!applicationToApprove) {
      throw new NotFoundError('Application does not exist');
    }

    if (
      !applicationToApprove.createdBy ||
      applicationToApprove.createdBy.toString() !== userId
    ) {
      throw new ForbiddenError(
        'You do not have permission to approve this application.'
      );
    }

    // Find the application entry by ID
    const application = applicationToApprove.applications.id(applicationId);

    if (!application) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: 'Application not found' });
    }

    // Check if the user has already been approved
    const alreadyApproved = applicationToApprove.classStudents.some(
      (student) => student.userId.toString() === application.userId.toString()
    );
    if (alreadyApproved) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: 'Already approved' });
    }

    // Move the application to classStudents and remove it from applications
    applicationToApprove.classStudents.push({
      userId: application.userId,
      appliedAt: application.appliedAt,
    });

    // Update the teacher's myStudents array
    const teacher = await Teacher.findById(userId);
    if (!teacher) {
      throw new NotFoundError('Teacher not found');
    }

    // Add student to teacher's myStudents array
    if (!teacher.myStudents.includes(application.userId)) {
      teacher.myStudents.push(application.userId);
    }

    await teacher.save();

    const classInfo = await Class.findById(classId);
    const lessonTitle = `Lesson 1: Welcome to ${classInfo.classTitle} class.`;
    const lessonDescription = `${classInfo.description}`;

    const lesson = new Lesson({
      createdBy: userId,
      studentId: application.userId,
      classId: classId,
      lessonTitle,
      type: classInfo.type,
      lessonDescription,
      lessonSchedule: {
        date: application.date,
        startTime: application.startTime,
      },
    });

    const savedLesson = await lesson.save();
    const lessonId = savedLesson._id;

    // Update the student's myTeachers array
    const student = await Student.findById(application.userId);
    if (!student) {
      throw new NotFoundError('Student not found');
    }

    // Add teacher to student's myTeachers array
    if (!student.myTeachers.includes(userId)) {
      student.myTeachers.push(userId);
    }

    // Add lesson to student's myLessons array
    if (!student.myLessons.includes(lessonId)) {
      student.myLessons.push(lessonId);
    }

    await student.save();

    // Remove the application from the applications array
    applicationToApprove.applications =
      applicationToApprove.applications.filter(
        (app) => app._id.toString() !== applicationId
      );

    await applicationToApprove.save();

    // Emit a message to the specific applicant
    global.io.emit(`approveMessage-${application.userId}`, {
      content: `Your application for the ${applicationToApprove.classTitle} class has been approved. Find more information about your first lesson in My Lessons.`,
    });

    res.status(StatusCodes.OK).json({ message: 'Applicant approved' });
  } catch (error) {
    console.error('Error approving application:', error);
    const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    const errorMessage = error.message || 'Internal server error';
    res.status(statusCode).json({ message: errorMessage });
  }
};

const rejectApplication = async (req, res) => {
  const { classId, applicationId } = req.params;
  const userId = req.user.userId;

  try {
    const applicationToReject = await Class.findById(classId);

    if (!applicationToReject) {
      throw new NotFoundError('Application does not exist');
    }

    if (
      !applicationToReject.createdBy ||
      applicationToReject.createdBy.toString() !== userId
    ) {
      throw new ForbiddenError(
        'You do not have permission to reject this application.'
      );
    }

    // Find the application to reject by ID
    const application = applicationToReject.applications.id(applicationId);

    if (!application) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: 'Application not found' });
    }

    // Remove the rejected application
    applicationToReject.applications = applicationToReject.applications.filter(
      (application) => application._id.toString() !== applicationId
    );

    await applicationToReject.save();

    // Emit a message to the specific applicant
    global.io.emit(`rejectMessage-${application.userId}`, {
      content: `Your application for the ${applicationToReject.classTitle} class has been declined.`,
    });

    res.status(StatusCodes.OK).json({ message: 'Application rejected' });
  } catch (error) {
    console.error('Error rejecting application:', error);
    const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    const errorMessage = error.message || 'Internal server error';
    res.status(statusCode).json({ message: errorMessage });
  }
};

module.exports = {
  displaySearchClasses,
  createClass,
  getClassDetails,
  editClass,
  deleteClass,
  applyForClass,
  approveApplication,
  rejectApplication,
};
