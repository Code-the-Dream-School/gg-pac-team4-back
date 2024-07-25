const Class = require("../models/Class");

const displaySearchClasses = async (req, res) => {
  try {
    const classes = await Class.find();
    console.log("Classes retrieved:", classes);
    res.status(200).json(classes);
  } catch (error) {
    console.error("Error retrieving classes:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const createClass = async (req, res) => {
  try {
    const { category, classTitle, description, price, duration, ages, type,goal, experience, other, availableTime } = req.body;
    const newClass = new Class({
      category,
      classTitle,
      description,
      price,
      duration,
      ages,
      type,
      goal, experience, other, availableTime
    });
    await newClass.save();
    console.log("Class has been created:", newClass);
    res.status(201).json({ message: "Class created successfully" });
  } catch (error) {
    console.error("Error creating class:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { displaySearchClasses, createClass };
