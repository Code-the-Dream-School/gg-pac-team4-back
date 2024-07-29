const express = require("express");
const router = express.Router();
const classesController = require('../controllers/classesController');
const authenticationMiddleware = require('../middleware/authentication')

// GET, POST, PATCH, DELETE
router
    .get("/classes", classesController.displaySearchClasses)
    .get("/classes/:classId", authenticationMiddleware, classesController.getClassDetails)
    .post("/classes", authenticationMiddleware, classesController.createClass)
    .patch("/classes/:classId", authenticationMiddleware, classesController.editClass)

module.exports = router;