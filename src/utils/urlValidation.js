const urlValidationPattern = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/;

const validateURL = (url) => {
  if (url === null) {
    return true;
  }
  return urlValidationPattern.test(url);
};

module.exports = { validateURL };
