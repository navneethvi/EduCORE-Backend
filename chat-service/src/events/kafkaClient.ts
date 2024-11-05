import { logger } from "@envy-core/common";
import { Kafka, logLevel } from "kafkajs";

const kafka = new Kafka({
  clientId: "chat-service",
  brokers: ["localhost:9092"],
  logLevel: logLevel.INFO,
});

export const consumer = kafka.consumer({ groupId: "chat-group" });

export const connectConsumer = async () => {
    
  await consumer.connect();

  logger.info("Connected to Kafka consumer");

  await consumer.subscribe({ topic: "tutor-created", fromBeginning: true });
  await consumer.subscribe({ topic: "student-created", fromBeginning: true });
};