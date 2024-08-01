import { Kafka, logLevel } from "kafkajs";

const kafka = new Kafka({
  clientId: "notification-service",
  brokers: ["localhost:9092"],
  logLevel: logLevel.INFO,
});

export const consumer = kafka.consumer({ groupId: "notification-group" });

export const connectConsumer = async () => {
  await consumer.connect();
  console.log("Connected to Kafka consumer");

  await consumer.subscribe({ topic: "email-verification", fromBeginning: true });
  await consumer.subscribe({ topic: "user-created", fromBeginning: true });
};
