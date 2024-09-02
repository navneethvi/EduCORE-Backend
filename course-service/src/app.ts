import app from "./express";
import { connectConsumer } from "./events/kafkaClient";
import { logger } from "@envy-core/common";
import connectDB from "./config/database";
import { courseConsumer } from "./events/consumer/consumers";

const port = 3003

connectConsumer()
  .then(() => {
    courseConsumer()
  })
  .catch((error) => {
    logger.error("Kafka consumer connection error:");
    console.log(error);
  });

connectDB()

app.listen(port, () => {
    logger.info(`Course Service is running on http://localhost:${port}`);
  });
  
