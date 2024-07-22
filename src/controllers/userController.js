const User = require("../models/User.js")
const bcrypt = require('bcryptjs')


const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body

    // check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    // Create a new user
    const newUser = new User({ firstName, lastName, email, password: hashedPassword
 })
    await newUser.save()
    console.log("User registered:", newUser)

    res.status(201).json({ message: "User registered successfully" })
  } catch (error) {
    console.error("Error registering user:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}

module.exports = { registerUser }