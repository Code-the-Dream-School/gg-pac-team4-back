const express = require("express");
const router = express.Router();
const classesController = require('../controllers/classesController');
const authenticationMiddleware = require('../middleware/authentication')

// GET, POST, PATCH, DELETE
router
    .get("/classes", classesController.displaySearchClasses)
    .post("/classes", authenticationMiddleware, classesController.createClass);



module.exports = router;