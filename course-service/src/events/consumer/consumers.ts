import { consumer } from "../kafkaClient";
import { logger } from "@envy-core/common";
import { Message } from "kafkajs"; // Import the KafkaJS Message type
import consumerController from "../../controllers/consumer.controller";

export const courseConsumer = async (): Promise<void> => {
  try {
    await consumer.run({
      eachMessage: async ({
        topic,
        message,
      }: {
        topic: string;
        message: Message;
      }) => {
        try {
          switch (topic) {
            case "tutor-created":
              await consumerController.handleTutorCreated(message);
              break;
            case "student-created":
              await consumerController.handleStudentCreated(message);
              break;
            default:
              logger.warn(`Unhandled topic: ${topic}`);
          }
        } catch (error) {
          if (error instanceof Error) {
            logger.error(
              `Error processing message from topic ${topic}: ${error.message}`
            );
          } else {
            logger.error(
              `Unexpected error processing message from topic ${topic}: ${String(
                error
              )}`
            );
          }
        }
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`Error running Kafka consumer: ${error.message}`);
    } else {
      logger.error(`Unexpected error running Kafka consumer: ${String(error)}`);
    }
  }
};
