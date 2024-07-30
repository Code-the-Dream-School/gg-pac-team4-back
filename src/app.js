require("dotenv").config({ path: __dirname + "/../.env" });

const express = require("express");
const mongoose = require("mongoose");
const app = express();
const cors = require("cors");
const favicon = require("express-favicon");
const logger = require("morgan");

const authenticationMiddleware = require("./middleware/authentication.js");
const errorHandlerMiddleware = require("./middleware/error-handler.js");
const notFound = require("./middleware/notFound.js");

const userRouter = require("./routes/userRouter.js");
const classesRouter = require("./routes/classesRouter.js");

const connectDB = require("./db/db.js");
connectDB();

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(logger("dev"));
app.use(express.static("public"));
app.use(favicon(__dirname + "/public/favicon.ico"));

// routes
app.use('/api/v1', userRouter );
app.use('/api/v1/classes', classesRouter );


// Error handling middleware
app.use(notFound);
app.use(errorHandlerMiddleware);

module.exports = app;
