const mongoose = require('mongoose');
require('colors');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log(`MongoDB connected: ${mongoose.connection.host}`.bgCyan.white);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`.bgRed.white);
    process.exit(1);
  }
};

module.exports = connectDB;
