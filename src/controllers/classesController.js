const cloudinary = require('cloudinary').v2;
const fs = require('fs').promises;
const Class = require('../models/Class');
const User = require('../models/User');
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
    }

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
    await User.findByIdAndUpdate(
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

    res.status(StatusCodes.OK).json({ project: updatedClass });
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

    // Check lesson type and handle applications accordingly
    if (classToApply.lessonType === '1:1') {
      // Check if there is already an application (if you are enforcing only one student per class)
      if (classToApply.applications.length > 0) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: 'This class is already booked.' });
      }

      classToApply.applications.push({ userId });
      // Remove the applied time slot from availableTime
      await Class.findByIdAndUpdate(
        classId,
        { $pull: { availableTime: { _id: availableTimeId } } },
        { new: true }
      );
      await classToApply.save();
      return res.status(StatusCodes.OK).json({
        message: 'You have successfully applied for the one-on-one class.',
      });
    } else if (classToApply.lessonType === 'Group') {
      // Add application for group lesson
      classToApply.applications.push({ userId });
      await classToApply.save();
      return res.status(StatusCodes.OK).json({
        message: 'You have successfully applied for the group class.',
      });
    } else {
      throw new BadRequestError('Invalid class type');
    }
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

    // Remove the application from the applications array
    applicationToApprove.applications =
      applicationToApprove.applications.filter(
        (app) => app._id.toString() !== applicationId
      );
    await applicationToApprove.save();

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
