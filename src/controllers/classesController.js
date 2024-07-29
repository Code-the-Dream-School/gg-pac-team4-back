const Class = require("../models/Class");
const { StatusCodes } = require("http-status-codes");
const {
  BadRequestError,
  NotFoundError,
  UnauthenticatedError,
} = require("../errors");
const ForbiddenError = require("../errors/forbidden");

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

const getClassDetails = async (req, res) => {
  const { classId } = req.params;

  try {
    const classDetail = await Class.findById(classId);

    if (!classDetail) {
      throw new NotFoundError("Class does not exist");
    }

    const response = {
      category: classDetail.category,
      classTitle: classDetail.classTitle,
      description: classDetail.description,
      price: classDetail.price,
      duration: classDetail.duration,
      ages: classDetail.ages,
      type: classDetail.type,
      goal: classDetail.goal,
      experience: classDetail.experience,
      other: classDetail.other,
      availableTime: classDetail.availableTime,
      createdBy: classDetail.createdBy,
      likes: classDetail.likes,
    };

    res.status(StatusCodes.OK).json({ class: response });
  } catch (error) {
    console.error("Error retrieving class details:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error" });
  }
};

const createClass = async (req, res) => {
  const createdBy = req.user.userId;

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
      createdBy,
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

const editClass = async (req, res) => {
  const { classId } = req.params;
  const userId = req.user.userId;
  try {
    const classToEdit = await Class.findById(classId);

    if (!classToEdit) {
      throw new NotFoundError("Class does not exist");
    }

    if (!classToEdit.createdBy || classToEdit.createdBy.toString() !== userId) {
      throw new ForbiddenError(
        "You do not have permission to edit this class."
      );
    }

    const updateData = {};
    if (req.body.classes) {
      for (const [key, value] of Object.entries(req.body.classes)) {
        updateData[`classes.${key}`] = value;
      }
    }

    Object.entries(req.body).forEach(([key, value]) => {
      if (key !== "classes") {
        updateData[key] = value;
      }
    });

    const updatedClass = await Class.findByIdAndUpdate(
      classId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.status(StatusCodes.OK).json({ project: updatedClass });
  } catch (error) {
    console.error("Error editing class:", error);
    const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    const errorMessage = error.message || "Internal server error";
    res.status(statusCode).json({ message: errorMessage });
  }
};

const deleteClass = async (req, res) => {
  const { classId } = req.params;
  const userId = req.user.userId;
  try {
    const classToDelete = await Class.findById(classId);

    if (!classToDelete) {
      throw new NotFoundError("Class does not exist");
    }

    if (
      !classToDelete.createdBy ||
      classToDelete.createdBy.toString() !== userId
    ) {
      throw new ForbiddenError(
        "You do not have permission to delete this class"
      );
    }

    await Class.findByIdAndDelete(classId);

    res.status(StatusCodes.OK).json({ message: "Class successfully deleted" });
  } catch (error) {
    console.error("Error deleting class:", error);
    const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    const errorMessage = error.message || "Internal server error";
    res.status(statusCode).json({ message: errorMessage });
  }
};

module.exports = {
  displaySearchClasses,
  createClass,
  getClassDetails,
  editClass,
  deleteClass,
};
