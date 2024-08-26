const express = require('express');
const router = express.Router();
const lessonsController = require('../controllers/lessonsController');
const authenticationMiddleware = require('../middleware/authentication');
// const upload = require('../middleware/multerMiddleware');

// GET, POST, PATCH, DELETE /api/v1/
router
  .get(
    '/myStudents/:studentId/lessons',
    authenticationMiddleware,
    lessonsController.displayStudentLessons
  )
  .get(
    '/myStudents/:studentId/lessons/:lessonId',
    authenticationMiddleware,
    lessonsController.getLessonDetails
  )
  .post(
    '/myStudents/:studentId/lessons',
    authenticationMiddleware,
    lessonsController.createLesson
  )
  .patch(
    '/myStudents/:studentId/lessons/:lessonId',
    authenticationMiddleware,
    lessonsController.editLesson
  )
  .delete(
    '/myStudents/:studentId/lessons/:lessonId',
    authenticationMiddleware,
    lessonsController.deleteLesson
  );

module.exports = router;
