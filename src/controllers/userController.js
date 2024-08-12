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

// Delete profile video
const deleteProfileVideo = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      throw new NotFoundError('User does not exist');
    }
    if (!user._id.equals(req.user.userId)) {
      throw new ForbiddenError(
        'You do not have permission to delete this profile video'
      );
    }

    // Check if the user has a profile video and delete it
    if (
      user.profileVideoPublicId &&
      user.profileVideoPublicId !== 'default_profile_video'
    ) {
      await cloudinary.uploader.destroy(user.profileVideoPublicId, {
        resource_type: 'video',
      });
    }

    // Set default video ID and URL
    user.profileVideoUrl = '';
    user.profileVideoPublicId = 'default_profile_video';

    // Save the user with updated profile
    await user.save({ runValidators: true });

    res.status(StatusCodes.OK).json({
      message: 'Profile video deleted and set to default successfully',
    });
  } catch (error) {
    console.error('Error deleting profile video:', error);
    res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

//add profile portfolio images
const addProfilePortfolioImage = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      throw new NotFoundError('User does not exist');
    }
    if (!user._id.equals(req.user.userId)) {
      throw new ForbiddenError(
        'You do not have permission to add images to this user profile'
      );
    }
    // Uploading new images to Cloudinary
    const uploadPromises = req.files.map(async (file) => {
      const filePath = file.path;
      const profilePortfolioImageResponse = await cloudinary.uploader.upload(
        filePath,
        {
          resource_type: 'image',
        }
      );
      await fs.unlink(filePath);
      return {
        url: profilePortfolioImageResponse.secure_url,
        publicId: profilePortfolioImageResponse.public_id,
      };
    });

    const uploadedImages = await Promise.all(uploadPromises);

    user.profilePortfolioImages = [
      ...user.profilePortfolioImages,
      ...uploadedImages,
    ];
    await user.save({ runValidators: true });

    res
      .status(StatusCodes.OK)
      .json({ message: 'Profile images successfully uploaded' });
  } catch (error) {
    console.error('Error during image upload:', error);
    res.status(500).json({
      message: 'Failed to upload profile images',
      error: error.message,
    });
  }
};

//delete profile portfolio image
const deleteProfilePortfolioImage = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      throw new NotFoundError('User does not exist');
    }
    if (!user._id.equals(req.user.userId)) {
      throw new ForbiddenError(
        'You do not have permission to delete portfolio image from this user profile'
      );
    }
    const imageIndex = user.profilePortfolioImages.findIndex(
      (image) => image.publicId === req.params.publicId
    );
    if (imageIndex === -1) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: 'Image not found' });
    }

    // Delete the image from Cloudinary
    await cloudinary.uploader.destroy(
      user.profilePortfolioImages[imageIndex].publicId,
      {
        resource_type: 'image',
      }
    );

    // Remove the image from the user's portfolio
    user.profilePortfolioImages.splice(imageIndex, 1);

    // Save user to the database
    await user.save({ runValidators: true });

    res
      .status(StatusCodes.OK)
      .json({ message: 'Profile portfolio image deleted successfully' });
  } catch (error) {
    console.error('Error deleting profile portfolio image:', error);
    return res.status(500).json({
      message: 'Failed to delete profile portfolio image',
      error: error.message,
    });
  }
};

//add profile portfolio video
const addProfilePortfolioVideo = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      throw new NotFoundError('User does not exist');
    }
    if (!user._id.equals(req.user.userId)) {
      throw new ForbiddenError(
        'You do not have permission to add video to this user profile'
      );
    }
    // Uploading new video to Cloudinary
    const uploadPromises = req.files.map(async (file) => {
      const filePath = file.path;
      const profilePortfolioVideoResponse = await cloudinary.uploader.upload(
        filePath,
        {
          resource_type: 'video',
        }
      );
      await fs.unlink(filePath);
      return {
        url: profilePortfolioVideoResponse.secure_url,
        publicId: profilePortfolioVideoResponse.public_id,
      };
    });

    const uploadedVideo = await Promise.all(uploadPromises);

    user.profilePortfolioVideos = [
      ...user.profilePortfolioVideos,
      ...uploadedVideo,
    ];
    await user.save({ runValidators: true });

    res
      .status(StatusCodes.OK)
      .json({ message: 'Profile video successfully uploaded' });
  } catch (error) {
    console.error('Error during video upload:', error);
    res.status(500).json({
      message: 'Failed to upload profile portfolio video',
      error: error.message,
    });
  }
};

//delete profile portfolio video
const deleteProfilePortfolioVideo = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      throw new NotFoundError('User does not exist');
    }
    if (!user._id.equals(req.user.userId)) {
      throw new ForbiddenError(
        'You do not have permission to delete portfolio video from this user profile'
      );
    }
    const videoIndex = user.profilePortfolioVideos.findIndex(
      (video) => video.publicId === req.params.publicId
    );
    if (videoIndex === -1) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: 'Video not found' });
    }

    // Delete the video from Cloudinary
    await cloudinary.uploader.destroy(
      user.profilePortfolioVideos[videoIndex].publicId,
      {
        resource_type: 'video',
      }
    );

    // Remove the video from the user's portfolio
    user.profilePortfolioVideos.splice(videoIndex, 1);

    // Save user to the database
    await user.save({ runValidators: true });

    res
      .status(StatusCodes.OK)
      .json({ message: 'Profile portfolio video deleted successfully' });
  } catch (error) {
    console.error('Error deleting profile portfolio video:', error);
    return res.status(500).json({
      message: 'Failed to delete profile portfolio video',
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
  deleteProfileVideo,
  addProfilePortfolioImage,
  deleteProfilePortfolioImage,
  addProfilePortfolioVideo,
  deleteProfilePortfolioVideo,
};
