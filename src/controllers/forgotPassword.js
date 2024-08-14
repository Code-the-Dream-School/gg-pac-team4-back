const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError } = require('../errors');

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw new BadRequestError('User with this email does not exist');
  }

  const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  await user.save();

  // const resetUrl = `http://localhost:5173/api/v1/reset-password/${resetToken}`;
  const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`; // Update URL
  // const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
  const message = `
    <p>You are receiving this email because you (or someone else) have requested the reset of a password. Please click the link below to reset your password:</p>
    <a href="${resetUrl}">Reset Password</a>
    <p>If you did not request this, please ignore this email.</p>
  `;

  try {
    await sendEmail(user.email, 'Password reset token', message);
    res
      .status(StatusCodes.OK)
      .json({ message: 'Email sent', token: resetToken });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    throw new BadRequestError('Email could not be sent');
  }
};

module.exports = forgotPassword;
