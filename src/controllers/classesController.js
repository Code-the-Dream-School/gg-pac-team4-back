const cloudinary = require('cloudinary').v2;
const fs = require('fs').promises;
const Class = require('../models/Class');
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

    const response = {
      category: classDetail.category,
      classTitle: classDetail.classTitle,
      description: classDetail.description,
      price: classDetail.price,
      duration: classDetail.duration,
      ages: classDetail.ages,
      type: classDetail.type,
      goal: classDetail.goal,
      experience: classDetail.experience,
      other: classDetail.other,
      availableTime: classDetail.availableTime,
      createdBy: classDetail.createdBy,
      likes: classDetail.likes,
      classImageUrl: classDetail.classImageUrl,
    };

    res.status(StatusCodes.OK).json({ class: response });
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
    });

    await newClass.save();
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
          classToEdit.classImagePublicId !== 'default_image_public'
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
        return res
          .status(500)
          .json({ message: 'Failed to upload image', error: error.message });
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

module.exports = {
  displaySearchClasses,
  createClass,
  getClassDetails,
  editClass,
  deleteClass,
};
