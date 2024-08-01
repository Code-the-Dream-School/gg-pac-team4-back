const { StatusCodes } = require('http-status-codes');

const errorHandlerMiddleware = (err, req, res, next) => {
  let customError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: err.message || 'Something went wrong, try again later',
  };

  if (err.name === 'ValidatorError') {
    customError.msg = Object.values(err.errors)
      .map((item) => item.message)
      .join(',');
    customError.statusCode = 400;
  }

  if (err.code && err.code === 11000) {
    customError.msg = `Duplicate value entered for ${Object.keys(
      err.keyValue
    )} field, please, choose another value`;
    customError.statusCode = 400;
  }

  if (err.name === 'CastError') {
    if (err.path === '_id') {
      customError.msg = `No item is found with id: ${err.value}`;
      customError.statusCode = 404;
    } else {
      customError.msg = `Invalid value for the '${err.path}' field: ${err.value}`;
      customError.statusCode = 400;
    }
  }

  //return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ err })
  return res.status(customError.statusCode).json({ msg: customError.msg });
};

module.exports = errorHandlerMiddleware;
