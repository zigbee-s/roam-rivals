require('dotenv').config();

const schoolDomains = [
  'school.edu',  // Replace this with actual school domains
  'college.edu', // Add more domains as needed
  'university.edu'
];

module.exports = {
  PORT: process.env.PORT || 3000,
  MONGODB_URI: process.env.MONGODB_URI,
  SCHOOL_DOMAINS: schoolDomains
};
