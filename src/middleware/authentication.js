const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');
const UnauthenticatedError = require('../errors/unauthenticated');

const authenticationMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: 'Authentication invalid' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { userId: payload.userId };
    next();
  } catch (error) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: 'Authentication invalid' });
  }
};

module.exports = authenticationMiddleware;
