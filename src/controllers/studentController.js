const User = require("../models/User.js");
//const bcrypt = require('bcryptjs');

const registerStudent = async (req, res) => {
  try {
    const { firstName, lastName, email, password, grade } = req.body; // Add 'grade' as a student-specific field

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newStudent = new User({
      firstName,
      lastName,
      email,
      password, // Directly use the password from req.body
      role: 'student', 
      age
    });
    await newStudent.save();
    console.log("Student registered:", newStudent);

    res.status(201).json({ message: "Student registered successfully" });
  } catch (error) {
    console.error("Error registering student:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { registerStudent };