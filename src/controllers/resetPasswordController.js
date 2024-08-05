const crypto = require('crypto');
const User = require('../models/User');

const resetPassword = async (req, res) => {
  const { resetToken, newPassword } = req.body;

  console.log('Received Token:', resetToken);

  try {
    // Проверяем, что токен передан
    if (!resetToken) {
      return res.status(400).json({ message: 'No reset token provided' });
    }

    // Хэшируем токен
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    console.log('Hashed Token:', hashedToken);

    // Ищем пользователя с предоставленным токеном и не истекшим сроком действия
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Устанавливаем новый пароль
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = resetPassword;
