const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config/config');

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI, {
    });
    console.log("Connected to MongoDB successfully!");
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    throw error;
  }
}

module.exports = connectDB;
