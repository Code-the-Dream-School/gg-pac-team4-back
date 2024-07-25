const User = require("../models/User.js");

const registerStudent = async (req, res) => {
  try {
    const { firstName, lastName, email, password, grade, age, phoneNumber, dateOfBirth, adultName } = req.body; 

    console.log("Request body:", req.body); // Log the request body for debugging

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Проверка и добавление имени взрослого, если возраст студента меньше 16 лет
    if (age < 16 && !adultName) {
      return res.status(400).json({ message: "Adult name is required for students under 16" });
    }

    const newStudentData = {
      firstName,
      lastName,
      email,
      password,
      role: 'student',
      grade,
      age,
      phoneNumber,
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