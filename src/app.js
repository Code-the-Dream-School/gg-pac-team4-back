require('dotenv').config({ path: __dirname + '/../.env' });

const express = require('express');
const mongoose = require("mongoose")
const app = express();
const cors = require('cors')
const favicon = require('express-favicon');
const logger = require('morgan');

const mainRouter = require('./routes/mainRouter.js');
const userRouter = require('./routes/userRouter.js')
const classesRouter = require('./routes/classesRouter.js')


const connectDB = require('./db/db.js');
connectDB();

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(logger('dev'));
app.use(express.static('public'))
app.use(favicon(__dirname + '/public/favicon.ico'));

// routes
app.use('/api/v1', mainRouter, userRouter, classesRouter, );

module.exports = app;