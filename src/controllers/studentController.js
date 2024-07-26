const User = require("../models/User.js");
const { calculateAge } = require("../utils/adultvalidation.js");

const registerStudent = async (req, res) => {
  try {
    const { firstName, lastName, email, password, dateOfBirth, adultName } = req.body; 

    console.log("Request body:", req.body); // Log the request body for debugging

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const age = calculateAge(dateOfBirth);

    // Checking student age if it's< 16, adultName is required
    if (age < 16 && (!adultName || adultName.trim() === '')) {
      return res.status(400).json({ message: "Adult name is required for students under 16" });
    }

    const newStudentData = {
      firstName,
      lastName,
      email,
      password,
      role: 'student',      
      dateOfBirth,
      adultName: age < 16 ? adultName : undefined
    };    

    const newStudent = new User(newStudentData);

    console.log("New student:", newStudent); // Log the new student before saving
    await newStudent.save();

    console.log("Student registered:", newStudent); // Log the saved student

    res.status(201).json({ message: "Student registered successfully" });
  } catch (error) {
    console.error("Error registering student:", error);
    res.status(500).json({ message: "Internal server error", error: error.message }); 
  }
};

module.exports = { registerStudent };