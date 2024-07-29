import mongoose from 'mongoose';
import { config } from './config';


const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI ||config.mongo.uri)
    console.log('Auth Database connected');
  } catch (error) {
    console.log("MongoDB connection error", error);
    
  }
};

export default connectDB;
