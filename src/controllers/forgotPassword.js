const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = user.generateResetPasswordToken();
    await user.save();
    console.log('Generated Reset Token:', resetToken);

    const resetUrl = `http://localhost:8000/api/v1/reset-password/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) have requested the reset of a password. Please make a post request to: \n\n ${resetUrl}`;

    console.log('Generated Reset Token:', resetToken);
    await sendEmail(user.email, 'Password reset token', message);

    res.status(200).json({ message: 'Email sent', resetToken });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = forgotPassword;
