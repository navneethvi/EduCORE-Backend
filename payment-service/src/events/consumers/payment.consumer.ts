import { consumer } from "../kafkaClient";
import { logger } from "@envy-core/common";
import { Message } from "kafkajs";
import consumerController from "../../controller/consumer.controller";

export const paymentConsumer = async (): Promise<void> => {
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
          logger.info(
            `Received message from topic ${topic}, partition ${message.partition}`
          );

          switch (topic) {
            case "course-created":
              await consumerController.handleCourseCreated(message);
              break;
            case "student-created":
              await consumerController.handleStudentCreated(message);
              break;
            case "course-updated":
              await consumerController.handleCourseUpdated(message);
              break;
              case "tutor-created":
              await consumerController.handleTutorCreated(message);
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

  const shutdown = async () => {
    logger.info("Shutting down Kafka consumer...");
    await consumer.disconnect();
    logger.info("Kafka consumer shut down successfully.");
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
};
