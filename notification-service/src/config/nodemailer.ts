import nodemailer from "nodemailer";

import { logger } from "@envy-core/common";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 587,
  secure: false,
  auth: {
    user: "navaneethvinod18@gmail.com",
    pass: "zomq cpea ruub asjr",
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
