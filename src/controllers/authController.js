const User = require("../models/User.js");
const { calculateAge } = require("../utils/adultValidation.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET
  const token = jwt.sign({ userId }, secret, { expiresIn: "1h" })
  return token
}

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
    const token = generateToken(newUser._id)
    res.status(201).json({ message: `${role.charAt(0).toUpperCase() + role.slice(1)} registered successfully` });
  } catch (error) {
    console.error(`Error registering ${role}:`, error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

const registerStudent = (req, res) => registerUser(req, res, 'student');
const registerTeacher = (req, res) => registerUser(req, res, 'teacher');

//Login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(401).json({ message: "Please provide email and password" });
    }
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email" });
    }
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }
    const token = generateToken(user._id);
    return res.status(201).json({
      message: "Login successful",
      user: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        _id: user._id,
        role: user.role,
        token
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};


module.exports = { registerStudent, registerTeacher, loginUser };