// backend/utils/adminSetup.js

const User = require('../models/userModel');
const bcrypt = require('bcrypt');

const createAdminUser = async () => {
  const adminEmail = 'admin@gmail.com';
  const adminUsername = 'admin_g';
  const adminPassword = 'admin123'; // Ensure this is hashed before saving
  const adminRoles = ['admin', 'user'];
  const adminName = 'Admin User';
  const adminAge = 23;

  const existingAdmin = await User.findOne({ email: adminEmail });

  if (!existingAdmin) {
    const adminUser = new User({
      name: adminName,
      username: adminUsername,
      email: adminEmail,
      password: adminPassword,
      age: adminAge,
      roles: adminRoles
    });

    await adminUser.save();
    console.log('Admin user created successfully');
  } else {
    console.log('Admin user already exists');
  }
};

module.exports = createAdminUser;
