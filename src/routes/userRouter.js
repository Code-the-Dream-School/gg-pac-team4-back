const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const forgotPassword = require('../controllers/forgotPassword');
const resetPassword = require('../controllers/resetPasswordController');
const authenticationMiddleware = require('../middleware/authentication');
const {
  validateStudent,
  validateTeacher,
} = require('../middleware/userValidation');

const { registerStudent, registerTeacher, loginUser, logoutUser } =
  authController;
const { getUsers, getUserById, updateUser, deleteUser } = userController;

// Authentication routes
router.post('/register/student', validateStudent, registerStudent);
router.post('/register/teacher', validateTeacher, registerTeacher);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

// Password reset routes
router.post('/forgot-password', forgotPassword);
router.patch('/reset-password', resetPassword);

// User routes
router.get('/users', authenticationMiddleware, getUsers);
router.get('/users/:id', authenticationMiddleware, getUserById);
router.patch('/users/:id', authenticationMiddleware, updateUser);
router.delete('/users/:id', authenticationMiddleware, deleteUser);

module.exports = router;
