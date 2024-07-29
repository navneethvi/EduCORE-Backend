import { consumer } from "../kafkaClient";

import { EmailService } from "../../services/email.service";

const emailService = new EmailService();

export const notificationConsumer = async () => {
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const { email, otp } = JSON.parse(message.value?.toString() || "{}");

      switch (topic) {
        case "email-verification":
          await emailService.sentOtpEmail(email, otp);
          break;
        case "user-created":
          await emailService.sentWelcomeEmail(email);
          break;
        default:
          console.warn(`Unhandled topic: ${topic}`);
      }
    },
  });
};
