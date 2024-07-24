const { body, validationResult } = require('express-validator');

// Define the validateStudent middleware
const validateStudent = [

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array().map(error => error.msg) });
    }
    next();
  }
];

// Define the validateTeacher middleware
const validateTeacher = [

  // Add any teacher-specific validations here
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array().map(error => error.msg) });
    }
    next();
  }
];

// Export all middleware functions at the bottom
module.exports = {
  validateStudent,
  validateTeacher
};