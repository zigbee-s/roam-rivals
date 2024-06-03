const { MongoClient } = require('mongodb');
const { MONGODB_URI } = require('../config/config'); 

const client = new MongoClient(MONGODB_URI, {});

async function connectDB() {
  try {
    await client.connect();
    console.log("Connected to MongoDB successfully!");
    return client;
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    throw error;
  }
}

module.exports = { connectDB, client };
