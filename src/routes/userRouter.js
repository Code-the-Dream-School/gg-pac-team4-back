const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { registerStudent, registerTeacher } = require('../controllers/authController');
const { validateStudent, validateTeacher } = require('../middleware/userValidation');
const userController = require('../controllers/userController');

// POST /api/v1/register/student
router.post("/register/student", validateStudent, registerStudent);

// POST /api/v1/register/teacher
router.post("/register/teacher", validateTeacher, registerTeacher);

// POST /api/v1/login
router.post("/login", authController.loginUser);

// POST /api/v1/logout
router.post("/logout", authController.logoutUser);

// CRUD User routes
router.get('/users', userController.getUsers);
router.get('/users/:id', userController.getUserById);
router.put('/users/:id', userController.updateUser);
router.delete('/users/:id', userController.deleteUser);

module.exports = router;