const getResetPasswordPage = (req, res) => {
  const { token } = req.params;
  // display the reset password page
  res.status(200).send(`
    <form id="reset-password-form">
      <input type="hidden" name="token" value="${token}" />
      <label for="newPassword">New Password:</label>
      <input type="password" id="newPassword" name="newPassword" required />
      <button type="submit">Reset Password</button>
    </form>
    <script>
      document.getElementById('reset-password-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const newPassword = document.getElementById('newPassword').value;
        const token = document.querySelector('input[name="token"]').value;

        const response = await fetch('http://localhost:8000/api/v1/reset-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            resetToken: token,
            newPassword,
          }),
        });

        const data = await response.json();
        if (data.message === 'Password reset successful') {
          window.location.href = data.redirectUrl;
        } else {
          alert(data.message);
        }
      });
    </script>
  `);
};

module.exports = { getResetPasswordPage };
