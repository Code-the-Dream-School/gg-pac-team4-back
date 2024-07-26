const User = require("../models/User.js");
//const bcrypt = require('bcryptjs');

const registerTeacher = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body; 

    console.log("Request body:", req.body);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const newTeacher = new User({
      firstName,
      lastName,
      email,
      password, // Directly use the password from req.body
      role: 'teacher'
    });
    console.log("New teacher:", newTeacher); 

    await newTeacher.save();

    console.log("Teacher registered:", newTeacher);

    res.status(201).json({ message: "Teacher registered successfully" });
  } catch (error) {
    console.error("Error registering teacher:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

module.exports = { registerTeacher };