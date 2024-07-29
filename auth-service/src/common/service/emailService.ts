import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 587,
  secure: false,
  auth: {
    user: "navaneethvinod18@gmail.com",
    pass: "zomq cpea ruub asjr",
  },
});

export async function sendMail(email: string, otp: string): Promise<boolean> {
  try {
    const message = await transporter.sendMail({
      from: "navaneethvinod18@gmail.com",
      to: email,
      subject: "Verify Your Account ✔",
      text: `Your OTP is ${otp}`,
      html: `<b><h4>Your OTP: ${otp}</h4><br><a href="">Click here</a></b>`,
    });

    console.log("Email verification OTP sent successfully:", message.messageId);
    return true;
  } catch (error) {
    console.error("Failed to send OTP email:", error);
    return false;
  }
}