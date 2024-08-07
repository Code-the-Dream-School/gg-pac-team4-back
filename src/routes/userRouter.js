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
router.post('/logout', authenticationMiddleware, logoutUser);

// User routes
router.use(authenticationMiddleware); //all routes below will use authenticationMiddleware
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.patch('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

module.exports = router;
