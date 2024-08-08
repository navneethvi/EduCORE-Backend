import { consumer } from "../kafkaClient";

import { EmailService } from "../../services/email.service";

import { logger } from "@envy-core/common";

const emailService = new EmailService();

export const notificationConsumer = async () => {
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const { email, otp } = JSON.parse(message.value?.toString() || "{}");

      switch (topic) {
        case "email-verification":
          await emailService.sentOtpEmail(email, otp);
          break;
        case "student-created":
          await emailService.sentWelcomeEmailForStudent(email);
          break;
        case "tutor-created":
          await emailService.sentWelcomeEmailForTutor(email);
          break;
        default:
          logger.warn(`Unhandled topic: ${topic}`);
      }
    },
  });
};
