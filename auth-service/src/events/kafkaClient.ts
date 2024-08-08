import { Kafka } from "kafkajs";

import { logger } from "@envy-core/common";

const kafka = new Kafka({
  clientId: "auth-service",
  brokers: ["127.0.0.1:9092"],
});

export const producer = kafka.producer();

export const connectProducer = async () => {
  try {
    await producer.connect();
    logger.info("Connected to Kafka producer");
  } catch (error) {
    logger.error("Error connecting to Kafka producer:");
    console.log(error);
  }
};

export const sendMessage = async (topic: string, message: object) => {
  try {
    await producer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }],
    });
    logger.info(`Message sent to topic ${topic}`);
    console.log("topic : ", topic, "   message : ", message);
  } catch (error) {
    logger.error("Error sending message:");
    console.log(error);
  }
};

const run = async (): Promise<void> => {
  try {
    await connectProducer();
    await sendMessage("test", { hello: "world" });
  } catch (error) {
    logger.error("Error in Kafka producer flow:");
    console.log(error);
  }
};

run();
