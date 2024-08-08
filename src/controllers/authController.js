const User = require('../models/User.js');
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

const registerUser = async (req, res, role) => {
  try {
    const { firstName, lastName, email, password, dateOfBirth, adultName } =
      req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new BadRequestError(
        'This email is already taken. If you forgot your password, please use the password recovery option.'
      );
    }

    const newUser = {
      firstName,
      lastName,
      email,
      password,
      role,
    };

    if (role === 'student') {
      const age = calculateAge(dateOfBirth);

      // Checking student age if it's < 16, adultName is required
      if (age < 16 && (!adultName || adultName.trim() === '')) {
        throw new BadRequestError(
          'Adult name is required for students under 16'
        );
      }

      newUser.dateOfBirth = dateOfBirth;
      newUser.adultName = age < 16 ? adultName : undefined;
    }

    const newUserInstance = new User(newUser);

    await newUserInstance.save();
    const token = generateToken(newUser._id);
    res.status(StatusCodes.CREATED).json({
      message: `${
        role.charAt(0).toUpperCase() + role.slice(1)
      } registered successfully`,
      token,
    });
  } catch (error) {
    console.error(`Error registering ${role}:`, error);
    const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    const errorMessage = error.message || `Error registering ${role}`;
    res.status(statusCode).json({ message: errorMessage });
  }
};

const registerStudent = (req, res) => registerUser(req, res, 'student');
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
    res.status(StatusCodes.OK).json({
      message: 'Login successful',
      user: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        _id: user._id,
        role: user.role,
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
