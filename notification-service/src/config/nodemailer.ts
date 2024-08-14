import nodemailer from "nodemailer";
import { configDotenv } from "dotenv";
import { logger } from "@envy-core/common";

configDotenv()

export const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 587,
  secure: false,
  auth: {
    user: process.env.GOOGLE_EMAIL,
    pass: process.env.GOOGLE_APP_PASS,
  },
});



transporter.verify((error, success) => {
  if (error) {
    logger.error("Nodemailer configuration error:");
    console.log(error);
    
  } else {
    logger.info("Nodemailer is ready to send emails");
  }
});
