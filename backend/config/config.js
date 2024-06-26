// confog/config.js
require('dotenv').config();

const schoolDomains = [
  'school.edu',  // Replace this with actual school domains
  'college.edu', // Add more domains as needed
  'university.edu',
  'gmail.com'
];

module.exports = {
  PORT: process.env.PORT || 3000,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
  SCHOOL_DOMAINS: schoolDomains,
  TEMPORARY_TOKEN_SECRET: process.env.TEMPORARY_TOKEN_SECRET
};
