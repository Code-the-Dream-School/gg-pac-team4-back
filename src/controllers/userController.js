const cloudinary = require('cloudinary').v2;
const fs = require('fs').promises;
const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const paginateAndSort = require('../utils/paginationSorting');
const { NotFoundError } = require('../errors');
const ForbiddenError = require('../errors/forbidden');

// Get all users with pagination
const getUsers = async (req, res) => {
  try {
    const { query, page, limit, sortBy, sortOrder } = req.query;
    const parsedQuery = JSON.parse(query || '{}'); // Parse the query string to an object
    const result = await paginateAndSort(
      User,
      parsedQuery,
      page,
      limit,
      sortBy,
      sortOrder
    );
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    console.error('Error retrieving users:', error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: 'Internal server error' });
  }
};

// Get a user by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      throw new NotFoundError('User does not exist');
    }
    res.status(StatusCodes.OK).json(user);
  } catch (error) {
    res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

// Update a user by ID
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      throw new NotFoundError('User does not exist');
    }
    if (!user._id.equals(req.user.userId)) {
      throw new ForbiddenError(
        'You do not have permission to edit this user profile'
      );
    }

    if (req.file) {
      try {
        // Deleting the old image from Cloudinary if it exists
        if (
          user.profileImagePublicId &&
          user.profileImagePublicId !== 'default_profile_image'
        ) {
          await cloudinary.uploader.destroy(user.profileImagePublicId);
        }

        // Uploading new image to Cloudinary
        const filePath = req.file.path;
        const profileImageResponse = await cloudinary.uploader.upload(filePath);
        await fs.unlink(filePath); // Cleaning up the temporary file

        // Updating image fields
        user.profileImageUrl = profileImageResponse.secure_url;
        user.profileImagePublicId = profileImageResponse.public_id;
      } catch (error) {
        return res.status(500).json({
          message: 'Failed to upload profile image',
          error: error.message,
        });
      }
    }

    // Update user fields manually
    Object.keys(req.body).forEach((key) => {
      user[key] = req.body[key];
    });

    // Save user to the database and return the updated user with hashed password
    await user.save({ runValidators: true });

    res.status(StatusCodes.OK).json({ message: 'User successfully updated' });
  } catch (error) {
    console.error('Error updating user:', error);
    res
      .status(error.statusCode || StatusCodes.BAD_REQUEST)
      .json({ error: error.message });
  }
};

// Delete a user by ID
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      throw new NotFoundError('User does not exist');
    }
    if (!user._id.equals(req.user.userId)) {
      throw new ForbiddenError(
        'You do not have permission to delete this user profile'
      );
    }

    if (user.profileImagePublicId !== 'default_profile_image') {
      await cloudinary.uploader.destroy(user.profileImagePublicId);
    }

    await User.findByIdAndDelete(user.id); // delete user from the database after checking the user id
    res.status(StatusCodes.OK).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

//add video
const addProfileVideo = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      throw new NotFoundError('User does not exist');
    }
    if (!user._id.equals(req.user.userId)) {
      throw new ForbiddenError(
        'You do not have permission to add a video to this user profile'
      );
    }
    // Delete the old video from Cloudinary if it exists
    if (
      user.profileVideoPublicId &&
      user.profileVideoPublicId !== 'default_profile_video'
    ) {
      await cloudinary.uploader.destroy(user.profileVideoPublicId, {
        resource_type: 'video',
      });
    }

    // Uploading new video to Cloudinary
    const filePath = req.file.path;
    const profileVideoResponse = await cloudinary.uploader.upload(filePath, {
      resource_type: 'video',
    });
    await fs.unlink(filePath); // Cleaning up the temporary file

    // Updating video fields
    user.profileVideoUrl = profileVideoResponse.secure_url;
    user.profileVideoPublicId = profileVideoResponse.public_id;

    Object.keys(req.body).forEach((key) => {
      user[key] = req.body[key];
    });

    // Save user to the database and return the updated user with hashed password
    await user.save({ runValidators: true });

    res
      .status(StatusCodes.OK)
      .json({ message: 'Profile video successfully updated' });
  } catch (error) {
    console.error('Error during video upload:', error);
    return res.status(500).json({
      message: 'Failed to upload profile video',
      error: error.message,
    });
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  addProfileVideo,
};
