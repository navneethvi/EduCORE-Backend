import { CreateTutorDto } from "../dtos/tutor.dto";
import { INewTutor, ITutor } from "../interfaces/tutor.interface";
import TutorRepository from "../repositories/tutor.repository";
import { sendMessage } from "../events/kafkaClient";
import bcryptjs from "bcryptjs";
import { generateToken } from "../utils/jwt";
import { OtpService } from "./otp.service";

import { ITutorService } from "../interfaces/tutor.service.interface";

class TutotService implements ITutorService {
  private tutorRepository = new TutorRepository();
  private otpService = new OtpService();

  public async createTutor(tutorData: CreateTutorDto): Promise<ITutor> {
    const hashedPassword = await bcryptjs.hash(tutorData.password, 10);

    const tutorInput: INewTutor = {
      name: tutorData.name,
      email: tutorData.email,
      phone: tutorData.phone,
      password: hashedPassword,
      bio: "",
      followers: [],
      role: tutorData.role || "tutor",
    };

    const newTutor = await this.tutorRepository.createTutor(tutorInput);

    await sendMessage("tutor-created", { email: newTutor.email });

    const token = generateToken({ id: newTutor._id, email: newTutor.email });

    const tutorWithToken = { ...newTutor.toObject(), token };

    return tutorWithToken;
  }

  public async signinTutor(
    email: string,
    password: string
  ): Promise<ITutor | null> {
    const tutor = await this.tutorRepository.findTutor(email);

    if (!tutor) {
      throw new Error("Invalid email or password.");
    }

    const isPasswordMatch = await bcryptjs.compare(password, tutor.password);

    console.log("passmatch : ", isPasswordMatch);

    if (!isPasswordMatch) {
      throw new Error("Invalid password.");
    }

    const token = generateToken({ id: tutor._id, email: tutor.email });

    const tutorWithToken = { ...tutor.toObject(), token };

    return tutorWithToken;
  }

  public async recoverAccount(email: string): Promise<void> {
    const tutor = await this.tutorRepository.findTutor(email);

    if (!tutor) {
      throw new Error("User not found.");
    }

    await this.otpService.generateAccRecoverOtp(email);
  }

  public async updatePassword(
    email: string,
    newPassword: string
  ): Promise<void> {
    const tutor = await this.tutorRepository.findTutor(email);

    if (!tutor) {
      throw new Error("User not found.");
    }

    const hashedPassword = await bcryptjs.hash(newPassword, 10);

    tutor.password = hashedPassword;

    await tutor.save();

    await this.otpService.deleteOtp(email);
  }
}

export default TutotService;
