// backend/db/db.js
const mongoose = require('mongoose');
const Grid = require('gridfs-stream');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { });
    console.log('MongoDB connected...');

    const conn = mongoose.connection;
    let gfs;

    conn.once('open', () => {
      gfs = Grid(conn.db, mongoose.mongo);
      gfs.collection('uploads');
      console.log('GridFS initialized...');
    });
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
