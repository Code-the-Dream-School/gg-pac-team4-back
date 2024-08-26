const { StatusCodes } = require('http-status-codes');

const errorHandlerMiddleware = (err, req, res, next) => {
  let customError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    message: err.message || 'Something went wrong, try again later',
  };

  if (err.name === 'ValidatorError') {
    customError.message = Object.values(err.errors)
      .map((item) => item.message)
      .join(',');
    customError.statusCode = 400;
  }

  if (err.code && err.code === 11000) {
    customError.message = `Duplicate value entered for ${Object.keys(
      err.keyValue
    )} field, please, choose another value`;
    customError.statusCode = 400;
  }

  if (err.name === 'CastError') {
    if (err.path === '_id') {
      customError.message = `No item is found with id: ${err.value}`;
      customError.statusCode = 404;
    } else {
      customError.message = `Invalid value for the '${err.path}' field: ${err.value}`;
      customError.statusCode = 400;
    }
  }

  //return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ err })
  return res
    .status(customError.statusCode)
    .json({ message: customError.message });
};

module.exports = errorHandlerMiddleware;
