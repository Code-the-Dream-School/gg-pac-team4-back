const express = require('express');
const router = express.Router();
const classesController = require('../controllers/classesController');
const authenticationMiddleware = require('../middleware/authentication');
const upload = require('../middleware/multerMiddleware');

// GET, POST, PATCH, DELETE /api/v1/classes
router
  .get('/', classesController.displaySearchClasses)
  .get('/:classId', authenticationMiddleware, classesController.getClassDetails)
  .post(
    '/',
    authenticationMiddleware,
    upload.single('classImage'),
    classesController.createClass
  )
  .post(
    '/:classId/apply',
    authenticationMiddleware,
    classesController.applyForClass
  )
  .post(
    '/:classId/approve/:applicationId',
    authenticationMiddleware,
    classesController.approveApplication
  )
  .post(
    '/:classId/reject/:applicationId',
    authenticationMiddleware,
    classesController.rejectApplication
  )
  .patch(
    '/:classId',
    authenticationMiddleware,
    upload.single('classImage'),
    classesController.editClass
  )
  .delete('/:classId', authenticationMiddleware, classesController.deleteClass);

module.exports = router;
