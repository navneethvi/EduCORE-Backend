import express from "express";
import { connectConsumer } from "events/kafkaClient";
import { notificationConsumer } from "events/consumers/notification.consumer";

const app = express();
app.use(express.json());

const port = 3002;

connectConsumer()
  .then(() => {
    notificationConsumer();
  })
  .catch((error) => {
    console.error("Kafka consumer connection error:", error);
  });

app.listen(port, () => {
  console.log(`Notification Service is running on http://localhost:${port}`);
});

export default app;