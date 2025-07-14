const mongoose = require('mongoose');
const { Log } = require('../middleware/logger');

const connectDB = async () => {
  try {
    await Log('backend', 'info', 'database', 'Attempting to connect to MongoDB...');
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await Log('backend', 'info', 'database', `MongoDB Connected: ${conn.connection.host}`);
    
    mongoose.connection.on('error', async (err) => {
      await Log('backend', 'error', 'database', `MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', async () => {
      await Log('backend', 'warn', 'database', 'MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', async () => {
      await Log('backend', 'info', 'database', 'MongoDB reconnected');
    });

    return conn;
  } catch (error) {
    await Log('backend', 'fatal', 'database', `MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
