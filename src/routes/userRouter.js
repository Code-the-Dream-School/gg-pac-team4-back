const express = require("express");
const router = express.Router();
const userController = require('../controllers/userController');
const studentController = require('../controllers/studentController');
const teacherController = require('../controllers/teacherController');

// POST /api/v1/register
router.post("/register", userController.registerUser);

// POST /api/v1/register/student
router.post("/register/student", studentController.registerStudent);

// POST /api/v1/register/teacher
router.post("/register/teacher", teacherController.registerTeacher);

module.exports = router;