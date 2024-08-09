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
    await User.findByIdAndDelete(user.id); // delete user from the database after checking the user id
    res.status(StatusCodes.OK).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
};
