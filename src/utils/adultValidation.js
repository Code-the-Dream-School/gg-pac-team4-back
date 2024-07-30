// Function to calculate age based on date of birth
function calculateAge(dateOfBirth) {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }  
  return age;
}

// Check if adult is required
const adultRequired = function() {
  return calculateAge(this.dateOfBirth) < 16;
};

// Validator for adult
const adultValidator = [
  {
    validator: function(v) {
      const age = calculateAge(this.dateOfBirth);
      // If the user is under 16, they must provide an adult name
      // `trim()` is used here to ensure that even if the value is just whitespace (e.g., "   "), it is considered empty.
      // This prevents users from bypassing validation by inputting only spaces.
      return !(age < 16 && (!v || v.trim() === ''));
    },
    message: 'Please provide an adult name for users under 16'
  }
];

// Validator to check if the adult name contains both first and last names
const adultNameFirstAndLast = {
  validator: function(value) {
      const adultNameParts = value.trim().split(/\s+/);
      return adultNameParts.length >= 2;
  },
  message: 'Adult name should contain both first name and last name'
};

module.exports = { calculateAge, adultRequired, adultValidator, adultNameFirstAndLast };