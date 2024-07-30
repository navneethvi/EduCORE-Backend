import Redis from "ioredis";
import { CreateStudentDto } from "../dtos/student.dto";
import { sendMessage } from "../events/kafkaClient";

const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
});

export class OtpService {
  async generateOtp(email: string): Promise<string> {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    await redis.setex(`otp:${email}`, 300, otp);
    console.log("Otp generated and seted in redis : ", otp);

    return otp;
  }

  async storeUserDataWithOtp(
    userData: CreateStudentDto,
    otp: string
  ): Promise<void> {
    await redis.setex(
      `user:${userData.email}:${otp}`,
      300,
      JSON.stringify(userData)
    );
    await redis.setex(
      `userData:${userData.email}`,
      300,
      JSON.stringify(userData)
    );
    await sendMessage("email-verification", { email: userData.email, otp });
  }

  async verifyOtp(email: string, otp: string): Promise<boolean> {
    const storedOtp = await redis.get(`otp:${email}`);
    return storedOtp === otp;
  }

  async getUserDataByOtp(
    email: string,
    otp?: string
  ): Promise<CreateStudentDto> {
    const key = otp ? `user:${email}:${otp}` : `userData:${email}`;
    const userData = await redis.get(key);
    if (userData) {
      return JSON.parse(userData);
    }
    throw new Error("User data not found");
  }

  async storeVerifiedUserData(
    email: string,
    userData: CreateStudentDto
  ): Promise<void> {
    await redis.setex(
      `verifiedUserData:${email}`,
      300,
      JSON.stringify(userData)
    );
  }

  async getVerifiedUserData(email: string): Promise<CreateStudentDto> {
    const userData = await redis.get(`verifiedUserData:${email}`);
    if (userData) {
      return JSON.parse(userData);
    }
    throw new Error("Verified user data not found");
  }

  async deleteUserOtpAndData(email: string, otp: string): Promise<void> {
    await redis.del(`otp:${email}`);
    await redis.del(`user:${email}:${otp}`);
    await redis.del(`userData:${email}`);
    console.log(`Deleted OTP and user data keys for email: ${email}`);
  }

  async deleteVerifiedUserData(email: string): Promise<void> {
    await redis.del(`verifiedUserData:${email}`);
    console.log(`Deleted verified user data key for email: ${email}`);
  }
}
