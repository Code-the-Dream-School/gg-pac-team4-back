const crypto = require('crypto');
const User = require('../models/User');

const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user || user.isResetPasswordTokenExpired()) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    await user.resetPassword(newPassword);

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = resetPassword;
