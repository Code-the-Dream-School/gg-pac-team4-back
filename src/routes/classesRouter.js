const express = require('express');
const router = express.Router();
const classesController = require('../controllers/classesController');
const authenticationMiddleware = require('../middleware/authentication');

// GET, POST, PATCH, DELETE /api/v1/classes
router
  .get('/', classesController.displaySearchClasses)
  .get('/:classId', authenticationMiddleware, classesController.getClassDetails)
  .post('/', authenticationMiddleware, classesController.createClass)
  .patch('/:classId', authenticationMiddleware, classesController.editClass)
  .delete('/:classId', authenticationMiddleware, classesController.deleteClass);

module.exports = router;
