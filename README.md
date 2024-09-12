# Back-End Repo for Node/React Practicum

TalentStudio: Back-End Repository
VisitWebsite https://gg-pac-team4-front-1.onrender.com/

TalentStudio
Welcome to TalentStudio, a revolutionary platform designed to connect students with dedicated teachers in the world of arts. Our application is aimed at creating a vibrant learning environment where students can enhance their artistic skills while teachers efficiently manage their lessons and interactions.
Core Features
Effortless Registration and Profile Creation
Student and Teacher Registration: Users can register as students or teachers, with field validations and notifications.
Password Reset: Users can request a password reset link via email.
Profile Management: Teachers can add profile information, upload images and videos, and manage their classes.
Search and Booking
Class Search: Authorized users can search and view classes and teacher profiles.
Lesson Booking: Students can book lessons, with real-time notifications for both students and teachers.
User Dashboards
Student Dashboard: View upcoming lessons, manage bookings, and communicate with teachers.
Teacher Dashboard: Manage classes, view student applications, and update lesson details.
Technology Stack
Core Technologies
Node.js: JavaScript runtime for server-side code.
Express.js: Web framework for handling HTTP requests and routing.

Database Management:
MongoDB: NoSQL database for storing data.
Mongoose: An Object Data Modeling (ODM) library for MongoDB, simplifying database interactions and schema validation.

Security and Authentication:
jsonwebtoken: For generating JWT tokens.
bcryptjs: For hashing passwords.
Security and Validation
express-validator: For validating and sanitizing input.

Web Security:
cors: Middleware for handling Cross-Origin Resource Sharing (CORS) in Express.js applications.

File Handling and Uploads:
multer: Middleware for handling file uploads.
cloudinary: For managing image uploads.
Real-Time Communication
socket.io: A library for real-time, bidirectional communication between clients and the server.
Email Sending
nodemailer: For sending email notifications.
File Handling
fs.promises: For file system operations.
Deployment
Render: For deploying the application.

Testing and Development Tools:
Postman: Tool for API testing.
husky: Git hooks library for enforcing code quality.
nodemon: A utility for automatically restarting the Node.js server during development.
prettier: Code formatter for maintaining code style consistency.
eslint: A tool for identifying and fixing problems in JavaScript code.
Schema Overview
Class: Manages class details such as title, description, price, and scheduling.
Lesson: Details about lessons, including schedule and associated files.
Student: Information on students, including their teachers and lessons.
Teacher: Teacher profiles, including videos, images, and schedule management.
Users: General user information and profile management.
Run the application:
npm run dev this will start the server. You can access the application by navigating to http://localhost:8000 in your web browser.

Environment Variables
Some variables need to be accessible across the application, but their values are fixed and might contain sensitive information.
To handle this securely, Dotenv is a lightweight module that imports environment variables from a .env file into process.env. For security reasons, the .env file is typically included in the .gitignore file by default. This prevents the file from being pushed to the repository and exposed publicly. However, the structure of the file can still be displayed, as long as it doesn’t contain sensitive information. Here is a list of environment variables for back end

# API_BASE_URL=http://localhost:8000/api/v1

# FRONTEND_URL=http://localhost:5173

# MONGODB_URI=url_number

# JWT_SECRET=your_SECRET_key

# JWT_LIFETIME=30d

# JWT_RESET_PASSWORD_EXPIRES_IN=72hr

# CLOUD_NAME=your_cloud_name

# CLOUD_API_KEY=your_API_key

# CLOUD_API_SECRET=you_secret_API

# GMAIL_USER=your_user_Gmail

# GMAIL_PASS=your_password_Gmail

# CLIENT_ID=your_CLIENT_ID

# CLIENT_SECRET=your_CLIENT_SECRET

# SESSION_SECRET=your_SESSION_SECRET

Future Enhancements
Online Payment Integration: Implement secure payment gateways for lesson fees.
Enhanced Communication: Add a built-in chat feature for real-time collaboration.

Meet the Team
Mentors:
Dan Polityka
Joannes Figeroa
Anna Pestova

Front-end developers:
Valentina Rudnitskaya
Tetiana Andrіanova
Elena Bychenkova

Our full-stack developers:
Mariya Doronkina
Oksana Feterovskaya

### Setting up local development environment

1. Create a folder to contain both the front-end and back-end repos
2. Clone this repository to that folder
3. Run `npm install` to install dependencies
4. Pull the latest version of the `main` branch (when needed)
5. Run `npm run dev` to start the development server
6. Open http://localhost:8000/api/v1/ with your browser to test.
7. Your back-end server is now running. You can now run the front-end app.

This repository contains the Node.js/Express server code for our application, interfacing with our Frontend Repository- https://github.com/Code-the-Dream-School/gg-pac-team4-front.
