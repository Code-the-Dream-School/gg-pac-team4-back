const express = require("express");
const router = express.Router();
const classesController = require('../controllers/classesController');

// GET /api/v1/classes
router.get("/classes", classesController.getAllClasses);

module.exports = router;