const Class = require("../models/Class");

const getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find();
    console.log("Classes retrieved:", classes);
    res.status(200).json(classes);
  } catch (error) {
    console.error("Error retrieving classes:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { getAllClasses };
