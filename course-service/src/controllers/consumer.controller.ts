import { Message } from "kafkajs"; // Import the KafkaJS Message type
import { logger } from "@envy-core/common";
import ConsumerService from "../services/consumer.service";
import { ITutor } from "../interfaces/tutor.interface";

class ConsumerController {
  private consumerService = new ConsumerService();

  public async handleTutorCreated(message: Message) {
    try {
      const value = message.value ? message.value.toString() : null;
      if (value) {
        console.log("Tutor created: ", value);
        const tutorData: ITutor = JSON.parse(value);
        await this.consumerService.createTutor(tutorData);
      } else {
        logger.error("Received empty message in 'tutor-created' topic.");
      }
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Error in handleTutorCreated: ${error.message}`);
      } else {
        logger.error(
          `Unexpected error in handleTutorCreated: ${String(error)}`
        );
      }
    }
  }
}

export default new ConsumerController();
