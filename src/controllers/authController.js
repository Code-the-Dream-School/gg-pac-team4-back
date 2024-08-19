const User = require('../models/User.js');
const Student = require('../models/Student.js');
const Teacher = require('../models/Teacher.js');
const { calculateAge } = require('../utils/adultValidation.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, UnauthenticatedError } = require('../errors');

const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET;
  const token = jwt.sign({ userId }, secret, { expiresIn: '1h' });
  return token;
};
// Function to register a user with a specified role
const registerUser = async (req, res, role) => {
  try {
    const { firstName, lastName, email, password, dateOfBirth, adultName } =
      req.body;

    // Check if a user with the provided email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new BadRequestError(
        'This email is already taken. If you forgot your password, please use the password recovery option.'
      );
    }

    let newUser;
    if (role === 'student') {
      const age = calculateAge(dateOfBirth);

      // Checking student age if it's < 16, adultName is required
      if (age < 16 && (!adultName || adultName.trim() === '')) {
        throw new BadRequestError(
          'Adult name is required for students under 16'
        );
      }

      // Create a new Student instance
      newUser = new Student({
        firstName,
        lastName,
        email,
        password,
        dateOfBirth,
        adultName: age < 16 ? adultName : undefined,
      });
    } else if (role === 'teacher') {
      newUser = new Teacher({
        firstName,
        lastName,
        email,
        password,
      });
    }

    // Save the new user to the database
    await newUser.save();
    // Generate a JWT token for the new user
    const token = generateToken(newUser._id);
    res.status(StatusCodes.CREATED).json({
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} registered successfully`,
      token,
    });
  } catch (error) {
    console.error(`Error registering ${role}:`, error);
    const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    const errorMessage = error.message || `Error registering ${role}`;
    res.status(statusCode).json({ message: errorMessage });
  }
};
// Function to register a student
const registerStudent = (req, res) => registerUser(req, res, 'student');
// Function to register a teacher
const registerTeacher = (req, res) => registerUser(req, res, 'teacher');

//Login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new BadRequestError('Please provide email and password');
    }
    const user = await User.findOne({ email });

    if (!user) {
      throw new UnauthenticatedError('Invalid email');
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new UnauthenticatedError('Invalid credentials');
    }
    const token = generateToken(user._id);

    const userInfo = user.toObject();
    delete userInfo.password;

    res.status(StatusCodes.OK).json({
      message: 'Login successful',
      user: {
        ...userInfo,
        token,
      },
    });
  } catch (error) {
    console.error('Error logging in:', error);
    const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    const errorMessage = error.message || 'Error logging in';
    res.status(statusCode).json({ message: errorMessage });
  }
};

//Logout
const logoutUser = async (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      expires: new Date(Date.now()),
    });
    res.status(StatusCodes.OK).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Error during logout:', err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: 'Logout failed' });
  }
};

module.exports = { registerStudent, registerTeacher, loginUser, logoutUser };
