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
const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  addProfileVideo,
  deleteProfileVideo,
  addProfilePortfolioImage,
  deleteProfilePortfolioImage,
  addProfilePortfolioVideo,
  deleteProfilePortfolioVideo,
} = userController;
const upload = require('../middleware/multerMiddleware');

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
router.patch(
  '/users/:id',
  authenticationMiddleware,
  upload.single('profileImage'),
  updateUser
);
router.patch(
  '/users/:id/video',
  authenticationMiddleware,
  upload.single('profileVideo'),
  addProfileVideo
);
router.patch(
  '/users/:id/portfolioImages',
  authenticationMiddleware,
  upload.array('profilePortfolioImages'),
  addProfilePortfolioImage
);
router.patch(
  '/users/:id/portfolioVideos',
  authenticationMiddleware,
  upload.array('profilePortfolioVideos'),
  addProfilePortfolioVideo
);
router.delete('/users/:id', authenticationMiddleware, deleteUser);
router.delete('/users/:id/video', authenticationMiddleware, deleteProfileVideo);
router.delete(
  '/users/:id/portfolioImages/:publicId',
  authenticationMiddleware,
  deleteProfilePortfolioImage
);
router.delete(
  '/users/:id/portfolioVideos/:publicId',
  authenticationMiddleware,
  deleteProfilePortfolioVideo
);

module.exports = router;
