const { body, validationResult } = require('express-validator');

const validateStudent = [
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array().map(error => error.msg) });
    }
    next();
  }
];

const validateTeacher = [  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array().map(error => error.msg) });
    }
    next();
  }
];

module.exports = {
  validateStudent,
  validateTeacher
};