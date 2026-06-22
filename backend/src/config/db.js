const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/whos_in';
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('Attempting to spin up an In-Memory MongoDB Server for development...');
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongoServer = await MongoMemoryServer.create();
        const memoryUri = mongoServer.getUri();
        const conn = await mongoose.connect(memoryUri);
        console.log(`In-Memory MongoDB Connected: ${conn.connection.host}`);
        global.mongoServer = mongoServer;
      } catch (memError) {
        console.error(`Failed to start In-Memory MongoDB: ${memError.message}`);
        console.warn('Backend server will continue running, but database operations will fail.');
      }
    } else {
      console.warn('Backend server will continue running, but database operations will fail.');
    }
  }
};

module.exports = connectDB;
