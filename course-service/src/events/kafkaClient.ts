import { logger } from "@envy-core/common";
import { Kafka, logLevel } from "kafkajs";

export const kafka = new Kafka({
  clientId: "course-service",
  brokers: ["localhost:9092"],
  logLevel: logLevel.INFO,
});

export const consumer = kafka.consumer({ groupId: "course-group" });

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


export const connectConsumer = async () => {
    
  await consumer.connect();

  logger.info("Connected to Kafka consumer");

  await consumer.subscribe({ topic: "student-created", fromBeginning: true });
  await consumer.subscribe({ topic: "tutor-created", fromBeginning: true });

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