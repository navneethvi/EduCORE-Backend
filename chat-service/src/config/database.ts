import mongoose from "mongoose";
import { config } from "./config";

import { logger } from "@envy-core/common";

const connectDB = async () => {
  try {
    await mongoose.connect(config.mongo.uri);
    logger.info("Chat Database connected");
  } catch (error) {
    logger.error("MongoDB connection error");
    console.log(error);
  }
};

export default connectDB;
