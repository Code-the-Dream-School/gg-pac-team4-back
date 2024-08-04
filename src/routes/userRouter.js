const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const forgotPassword = require('../controllers/forgotPassword');
const resetPassword = require('../controllers/resetPasswordController');
const authMiddleware = require('../middleware/authentication');
const {
  getResetPasswordPage,
} = require('../controllers/resetPasswordPageController');
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

// User routes
router.get('/users', authMiddleware, getUsers);
router.get('/users/:id', authMiddleware, getUserById);
router.patch('/users/:id', authMiddleware, updateUser);
router.delete('/users/:id', authMiddleware, deleteUser);

// Forgot password route (Check here)
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/reset-password/:token', getResetPasswordPage);

module.exports = router;
