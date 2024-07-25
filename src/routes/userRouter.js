const express = require("express");
const router = express.Router();
const userController = require('../controllers/userController');
const studentController = require('../controllers/studentController');
const teacherController = require('../controllers/teacherController');
const { validateStudent, validateTeacher } = require('../middleware/validationMiddleware');

// POST /api/v1/register
router.post("/register", userController.registerUser);

// POST /api/v1/register/student
router.post("/register/student", validateStudent, studentController.registerStudent);

// POST /api/v1/register/teacher
router.post("/register/teacher", validateTeacher, teacherController.registerTeacher);

module.exports = router;