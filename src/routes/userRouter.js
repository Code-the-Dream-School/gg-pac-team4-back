const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const {
  registerStudent,
  registerTeacher,
} = require('../controllers/authController');
const {
  validateStudent,
  validateTeacher,
} = require('../middleware/userValidation');

// POST /api/v1/register/student
router.post('/register/student', validateStudent, registerStudent);

// POST /api/v1/register/teacher
router.post('/register/teacher', validateTeacher, registerTeacher);

// POST /api/v1/login
router.post('/login', authController.loginUser);

// POST /api/v1/logout
router.post('/logout', authController.logoutUser);

module.exports = router;
