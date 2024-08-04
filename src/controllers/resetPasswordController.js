const crypto = require('crypto');
const User = require('../models/User');

const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  console.log('Received Token:', token);

  try {
    console.log('Received Token:', token);
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    console.log('Hashed Token:', hashedToken);

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user || user.isResetPasswordTokenExpired()) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
    await user.resetPassword(newPassword);

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = resetPassword;
