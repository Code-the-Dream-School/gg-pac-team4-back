const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const paginateAndSort = require("../utils/paginationSorting");
const { NotFoundError } = require("../errors");

// Get all users with pagination
const getUsers = async (req, res) => {
  try {
    const { query, page, limit, sortBy, sortOrder } = req.query;
    const parsedQuery = JSON.parse(query || '{}'); // Parse the query string to an object
    const result = await paginateAndSort(User, parsedQuery, page, limit, sortBy, sortOrder);
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    console.error("Error retrieving users:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
  }
};

// Get a user by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      throw new NotFoundError("User does not exist");
    }
    res.status(StatusCodes.OK).json(user);
  } catch (error) {
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

// Update a user by ID
const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!user) {
      throw new NotFoundError("User does not exist");
    }
    res.status(StatusCodes.OK).json(user);
  } catch (error) {
    res.status(error.statusCode || StatusCodes.BAD_REQUEST).json({ error: error.message });
  }
};

// Delete a user by ID
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      throw new NotFoundError("User does not exist");
    }
    res.status(StatusCodes.OK).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

module.exports = { 
  getUsers, 
  getUserById, 
  updateUser,
  deleteUser
};