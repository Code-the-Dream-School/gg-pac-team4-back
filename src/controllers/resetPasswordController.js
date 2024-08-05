const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError } = require('../errors');

const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    throw new BadRequestError('Invalid request');
  }

  try {
    // Decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user
    const user = await User.findOne({
      _id: decoded.userId,
      resetPasswordToken: token,
    });

    if (!user || user.isResetPasswordTokenExpired()) {
      throw new BadRequestError('Invalid or expired token');
    }

    // Set the new password and clear the token
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    // Save the user
    await user.save();

    res.status(StatusCodes.OK).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Error resetting password:', error);
    throw new BadRequestError('Invalid request');
  }
};

module.exports = resetPassword;
