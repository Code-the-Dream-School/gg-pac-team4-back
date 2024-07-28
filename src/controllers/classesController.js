const Class = require("../models/Class");
const { StatusCodes } = require("http-status-codes");
const {
  BadRequestError,
  NotFoundError,
  UnauthenticatedError,
} = require("../errors");

const displaySearchClasses = async (req, res) => {
  let { page, limit, search, sortBy, sortOrder } = req.query;

  page = Number(page) || 1;
  limit = Number(limit) || 5;
  const skip = (page - 1) * limit;

  sortBy = sortBy || "classTitle";
  sortOrder = sortOrder === "desc" ? -1 : 1;

  const searchRegex = search ? new RegExp(search, "i") : {};

  try {
    let query = {};

    if (search) {
      query = {
        $or: [
          { classTitle: searchRegex },
          { category: searchRegex },
          { description: searchRegex },
        ],
      };
    }

    const classes = await Class.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ [sortBy]: sortOrder });

    const total = await Class.countDocuments(query);

    res.status(StatusCodes.OK).json({
      classes,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error retrieving classes:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error" });
  }
};

const createClass = async (req, res) => {
  try {
    const {
      category,
      classTitle,
      description,
      price,
      duration,
      ages,
      type,
      goal,
      experience,
      other,
      availableTime,
    } = req.body;

    const existingClass = await Class.findOne({
      classTitle,
      description,
      category,
      price,
      duration,
    });
    if (existingClass) {
      throw new BadRequestError(
        "Class with this title and description already exists."
      );
    }

    const newClass = new Class({
      category,
      classTitle,
      description,
      price,
      duration,
      ages,
      type,
      goal,
      experience,
      other,
      availableTime,
    });

    await newClass.save();
    res
      .status(StatusCodes.CREATED)
      .json({ message: "Class created successfully" });
  } catch (error) {
    console.error("Error creating class:", error);
    const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    const errorMessage = error.message || "Error creating class";
    res.status(statusCode).json({ error: errorMessage });
  }
};

module.exports = { displaySearchClasses, createClass };
