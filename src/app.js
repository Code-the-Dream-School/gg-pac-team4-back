require('dotenv').config({ path: __dirname + '/../.env' });

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const favicon = require('express-favicon');
const logger = require('morgan');
const cloudinary = require('cloudinary').v2;

const errorHandlerMiddleware = require('./middleware/error-handler.js');
const notFound = require('./middleware/notFound.js');

const app = express();

//import {v2 as cloudinary} from 'cloudinary';
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const User = require('./models/User'); // Убедитесь, что путь правильный

const userRouter = require('./routes/userRouter.js');
const classesRouter = require('./routes/classesRouter.js');
const lessonsRouter = require('./routes/lessonsRouter.js');

const connectDB = require('./db/db.js');
connectDB();

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(logger('dev'));
app.use(express.static('public'));
app.use(favicon(__dirname + '/public/favicon.ico'));

// routes
app.get('/', (req, res) => {
  //for deploy reasons
  res.redirect('/api/v1');
});
app.use('/api/v1', userRouter, lessonsRouter);

app.use('/api/v1/classes', classesRouter);

// Error handling middleware
app.use(notFound);
app.use(errorHandlerMiddleware);

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: 'http://localhost:5173', method: ['GET', 'POST'] },
});
global.io = io;

module.exports = server;
