const crypto = require('crypto');
const User = require('../models/User');

const resetPassword = async (req, res) => {
  const { resetToken, newPassword } = req.body;

  //check if the token and new password are provided
  try {
    if (!resetToken || !newPassword) {
      return res.status(400).json({ message: 'Invalid request' });
    }

    // hash the token
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    //find the user with the hashed token and the token has not expired
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user || user.isResetPasswordTokenExpired()) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // set the new password and clear the reset token and expiry date
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res
      .status(200)
      .json({
        message: 'Password reset successful',
        redirectUrl: '/api/v1/login',
      });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = resetPassword;
