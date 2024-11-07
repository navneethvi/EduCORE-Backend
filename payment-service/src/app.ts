import app from "./express";
import { logger } from "@envy-core/common";
import { paymentConsumer } from "./events/consumers/payment.consumer";
import { connectConsumer } from "./events/kafkaClient";
import connectDB from "./config/database";
import { createServer } from "http";


const port = 3005;

connectConsumer()
  .then(() => {
    paymentConsumer();
  })
  .catch((error) => {
    logger.error("Kafka consumer connection error:");
    console.log(error);
  });

connectDB();

const server = createServer(app);


server.listen(port, () => {
  logger.info(`Payment Service is running on http://localhost:${port}`);
});
