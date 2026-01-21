import mongoose from "mongoose";

const connectionString = process.env.MongoDb_URI;

async function connectDB() {
  try {
    if (!connectionString) {
      console.log("Please set the MongoDb_URI first in -> .env file");
      return;
    }
    const connectionInstance = await mongoose.connect(connectionString);
    console.log(`Database name: ${connectionInstance.connection.name}`);
    console.log(`Database host: ${connectionInstance.connection.host}`);
    console.log(`Database port: ${connectionInstance.connection.port}`);
  } catch (error) {
    console.log("failed to connect to DB", error);
  }
}

export { connectDB };
