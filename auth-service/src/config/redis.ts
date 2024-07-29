import { createClient } from "redis";

export const redisClient = createClient({
  url: "redis://localhost:6379",
});

redisClient.on("error", (err) => {
  console.error("Redis error:", err);
});

redisClient.on("connect", () => {
  console.log("Connected to Redis");
});

async () => {
  try {
    await redisClient.connect();
    console.log("Redis Client Connected");
  } catch (error) {
    console.error("Redis connection error:", error);
  }
};
