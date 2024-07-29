const express = require('express');
const router = express.Router();
const { registerStudent, registerTeacher } = require('../controllers/authController');
const { validateStudent, validateTeacher } = require('../middleware/userValidation');

// POST /api/v1/register/student
router.post("/register/student", validateStudent, registerStudent);

// POST /api/v1/register/teacher
router.post("/register/teacher", validateTeacher, registerTeacher);

module.exports = router;