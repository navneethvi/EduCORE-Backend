import { logger } from "@envy-core/common";
import { transporter } from "../config/nodemailer";

export class EmailService {
  public async sentOtpEmail(email: string, otp: string): Promise<void> {
    try {
      const message = await transporter.sendMail({
        from: "navaneethvinod18@gmail.com",
        to: email,
        subject: "Verify Your Account ✔",
        text: `Hello,

Your OTP for account verification is: ${otp}

Please use this code to verify your account. If you did not request this, please ignore this email.

Best regards,
The Educore Team
        `,
        html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Account</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding: 10px 0;
            background-color: #4CAF50;
            color: #ffffff;
        }
        .content {
            padding: 20px;
            text-align: center;
        }
        .content h4 {
            color: #333333;
        }
        .content p {
            color: #555555;
        }
        .footer {
            text-align: center;
            padding: 10px 0;
            background-color: #4CAF50;
            color: #ffffff;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Account Verification</h1>
        </div>
        <div class="content">
            <h4>Your OTP for account verification is:</h4>
            <p style="font-size: 24px; font-weight: bold;">${otp}</p>
            <p>Please use this code to verify your account. If you did not request this, please ignore this email.</p>
        </div>
        <div class="footer">
            <p>Best regards,<br>The Educore Team</p>
        </div>
    </div>
</body>
</html>
        `,
      });
      logger.info(
        `Email verification OTP sent successfully:: ${message.messageId}`
      );
    } catch (error) {
      logger.error("Failed to send OTP email:");
      console.log(error);
    }
  }

  public async sentWelcomeEmailForStudent(email: string): Promise<void> {
    try {
      const message = await transporter.sendMail({
        from: "navaneethvinod18@gmail.com",
        to: email,
        subject: "Welcome to Educore",
        text: `Hello,

Welcome to Educore! We're excited to have you on board. Your account has been successfully created, and you can now start exploring all the features we offer.

If you have any questions or need assistance, feel free to reach out to our support team.

Best regards,
The Educore Team
        `,
        html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Educore</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding: 10px 0;
            background-color: #4CAF50;
            color: #ffffff;
        }
        .content {
            padding: 20px;
            text-align: center;
        }
        .content h1 {
            color: #333333;
        }
        .content p {
            color: #555555;
        }
        .footer {
            text-align: center;
            padding: 10px 0;
            background-color: #4CAF50;
            color: #ffffff;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to Educore</h1>
        </div>
        <div class="content">
            <h2>Hello,</h2>
            <p>We're excited to have you on board. Your account has been successfully created, and you can now start exploring all the features we offer.</p>
            <p>If you have any questions or need assistance, feel free to reach out to our support team.</p>
        </div>
        <div class="footer">
            <p>Best regards,<br>The Educore Team</p>
        </div>
    </div>
</body>
</html>
        `,
      });

      logger.info(`Welcome message sent successfully: ${message.messageId}`);
    } catch (error) {
      logger.error("Error sending welcome email:");
      console.log(error);
    }
  }

  public async sentWelcomeEmailForTutor(email: string): Promise<void> {
    try {
      const message = await transporter.sendMail({
        from: "navaneethvinod18@gmail.com",
        to: email,
        subject: "Welcome to Educore",
        text: `Hello,

Welcome to Educore! We're excited to have you on board. Your account has been successfully created, and you can now start exploring all the features we offer.

If you have any questions or need assistance, feel free to reach out to our support team.

Best regards,
The Educore Team
        `,
        html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Educore</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding: 10px 0;
            background-color: #4CAF50;
            color: #ffffff;
        }
        .content {
            padding: 20px;
            text-align: center;
        }
        .content h1 {
            color: #333333;
        }
        .content p {
            color: #555555;
        }
        .footer {
            text-align: center;
            padding: 10px 0;
            background-color: #4CAF50;
            color: #ffffff;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to Educore</h1>
        </div>
        <div class="content">
            <h2>Hello,</h2>
            <p>We're excited to have you on board. Your account has been successfully created, and you can now start exploring all the features we offer.</p>
            <p>If you have any questions or need assistance, feel free to reach out to our support team.</p>
        </div>
        <div class="footer">
            <p>Best regards,<br>The Educore Team</p>
        </div>
    </div>
</body>
</html>
        `,
      });

      logger.info(`Welcome message sent successfully: ${message.messageId}`);
    } catch (error) {
      logger.error("Error sending welcome email:");
      console.log(error);
    }
  }
}
