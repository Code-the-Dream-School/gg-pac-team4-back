const getResetPasswordPage = (req, res) => {
  const { token } = req.params;
  //display the reset password page
  res.status(200).send(`
    <form action="/api/v1/reset-password" method="PUT">
      <input type="hidden" name="token" value="${token}" />
      <label for="newPassword">New Password:</label>
      <input type="password" id="newPassword" name="newPassword" required />
      <button type="submit">Reset Password</button>
    </form>
  `);
};

module.exports = { getResetPasswordPage };
