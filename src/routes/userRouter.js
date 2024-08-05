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

// User routes for CRUD operations
router.get('/users', authMiddleware, getUsers);
router.get('/users/:id', authMiddleware, getUserById);
router.patch('/users/:id', authMiddleware, updateUser);
router.delete('/users/:id', authMiddleware, deleteUser);

// Forgot password route (handles email sending)
router.post('/forgot-password', forgotPassword);

// Reset password route (handles JWT based reset)
router.post('/reset-password', resetPassword);

// Route to get reset password page
router.get('/reset-password/:token', getResetPasswordPage);
module.exports = router;
