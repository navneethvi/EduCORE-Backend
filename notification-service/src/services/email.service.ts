import { transporter } from "../config/nodemailer";

export class EmailService {
  public async sentOtpEmail(email: string, otp: string): Promise<void> {
    try {
      const message = await transporter.sendMail({
        from: "navaneethvinod18@gmail.com",
        to: email,
        subject: "Verify Your Account ✔",
        text: `Your OTP is ${otp}`,
        html: `<b><h4>Your OTP: ${otp}</h4><br><a href="">Click here</a></b>`,
      });

      console.log(
        "Email verification OTP sent successfully:",
        message.messageId
      );
    } catch (error) {
      console.error("Failed to send OTP email:", error);
    }
  }

  public async sentWelcomeEmail(email: string): Promise<void> {
    try {
      const message = await transporter.sendMail({
        from: "navaneethvinod18@gmail.com",
        to: email,
        subject: "Welcome to Our Service",
        text: `Welcome to our service! Your account has been created.`,
        html: `<b><h4>Welcome to our service!</h4><p>Your account has been created.</p></b>`,
      });

      console.log(
        "Email verification OTP sent successfully:",
        message.messageId
      );
    } catch (error) {
      console.error("Error sending welcome email:", error);
    }
  }
}
