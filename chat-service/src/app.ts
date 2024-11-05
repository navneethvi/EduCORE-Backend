import app from "./express";
import { logger } from "@envy-core/common";
import { chatConsumer } from "./events/consumer/consumer";
import { connectConsumer } from "./events/kafkaClient";
import connectDB from "./config/database";

const port = 3004;

connectConsumer()
  .then(() => {
    chatConsumer()
  })
  .catch((error) => {
    logger.error("Kafka consumer connection error:");
    console.log(error);
  });

connectDB()

app.listen(port, () => {
  logger.info(`Chat Service is running on http://localhost:${port}`);
});
