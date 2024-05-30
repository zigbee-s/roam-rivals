const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {});

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

module.exports = { connectDB };
