import express from "express";
import { connectConsumer } from "events/kafkaClient";
import { notificationConsumer } from "events/consumers/notification.consumer";

import { logger } from "@envy-core/common";

const app = express();
app.use(express.json());

const port = 3002;

connectConsumer()
  .then(() => {
    notificationConsumer();
  })
  .catch((error) => {
    logger.error("Kafka consumer connection error:");
    console.log(error);
  });

app.listen(port, () => {
  logger.info(`Notification Service is running on http://localhost:${port}`);
});

export default app;
