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
const userController = require('../controllers/userController');
const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require('../controllers/userController');

// POST /api/v1/register/student
router.post('/register/student', validateStudent, registerStudent);

// POST /api/v1/register/teacher
router.post('/register/teacher', validateTeacher, registerTeacher);

// POST /api/v1/login
router.post('/login', authController.loginUser);

// POST /api/v1/logout
router.post('/logout', authController.logoutUser);

router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

module.exports = router;
