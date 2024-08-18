import { createClient } from "redis";

import { logger } from "@envy-core/common";

export const redisClient = createClient({
  url: "redis://localhost:6379",
});

redisClient.on("error", (err) => {
  console.error("Redis error:", err);
});

redisClient.on("connect", () => {
  console.log("Connected to Redis");
});

(async () => {
  try {
    await redisClient.connect(); 
    logger.info("Redis Client Connected")
  } catch (error) {
    logger.error("Redis connection error:")
    console.log(error);
  }
})();