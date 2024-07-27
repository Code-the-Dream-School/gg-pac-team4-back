const User = require("../models/User.js");
const { calculateAge } = require("../utils/adultValidation.js");

const registerUser = async (req, res, role) => {
  try {
    const { firstName, lastName, email, password, dateOfBirth, adultName } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = {
      firstName,
      lastName,
      email,
      password,
      role
    };

    if (role === 'student') {
      const age = calculateAge(dateOfBirth);

      // Checking student age if it's < 16, adultName is required
      if (age < 16 && (!adultName || adultName.trim() === '')) {
        return res.status(400).json({ message: "Adult name is required for students under 16" });
      }

      newUser.dateOfBirth = dateOfBirth;
      newUser.adultName = age < 16 ? adultName : undefined;
    }

    const newUserInstance = new User(newUser);

    await newUserInstance.save();

    res.status(201).json({ message: `${role.charAt(0).toUpperCase() + role.slice(1)} registered successfully` });
  } catch (error) {
    console.error(`Error registering ${role}:`, error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

const registerStudent = (req, res) => registerUser(req, res, 'student');
const registerTeacher = (req, res) => registerUser(req, res, 'teacher');

module.exports = { registerStudent, registerTeacher };