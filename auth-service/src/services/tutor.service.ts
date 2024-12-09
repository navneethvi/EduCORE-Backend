import { CreateTutorDto } from "../dtos/tutor.dto";
import { INewTutor, ITutor } from "../interfaces/tutor.interface";
import { sendMessage } from "../events/kafkaClient";
import bcryptjs from "bcryptjs";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";
import { OAuth2Client } from "google-auth-library";

import { ITutorService } from "../interfaces/tutor.service.interface";
import { HttpStatusCodes } from "@envy-core/common";
import CustomError from "@envy-core/common/build/errors/CustomError";
import { ITutorRepository } from "../interfaces/tutor.repository.interface";
import { IOtpService } from "../interfaces/otp.service.interface";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

class TutorService implements ITutorService {
  private tutorRepository: ITutorRepository;
  private otpService: IOtpService;

  constructor(tutorRepository: ITutorRepository, otpService: IOtpService) {
    this.tutorRepository = tutorRepository;
    this.otpService = otpService;
  }

  public async checkUserExists(tutorData: CreateTutorDto): Promise<void> {
    if (tutorData.password !== tutorData.confirmPassword) {
      throw Error("Password do not match !!!");
    }

    const tutorExists = await this.tutorRepository.findTutor(tutorData.email);

    if (tutorExists) {
      throw Error("Tutor with this email already exists !!!");
    }

    const otp = await this.otpService.generateOtp(tutorData.email);

    if (!otp) {
      throw Error("Failed to generate otp");
    }

    await this.otpService.storeUserDataWithOtp(tutorData, otp);
  }

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

    await sendMessage("tutor-created", {
      _id: newTutor._id,
      name: newTutor.name,
      email: newTutor.email,
      phone: newTutor.phone,
      // password: newTutor.password,
      is_blocked: newTutor.is_blocked,
      is_verified: newTutor.is_verified,
      bio: "",
      followers: [],
      role: newTutor.role || "tutor",
    });

    const accessToken = generateAccessToken({
      id: newTutor._id,
      email: newTutor.email,
      role: "tutor",
    });

    const refreshToken = generateRefreshToken({
      id: newTutor._id,
      email: newTutor.email,
      role: "tutor",
    });

    const tutorWithToken = {
      ...newTutor.toObject(),
      accessToken,
      refreshToken,
    };

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

    if (tutor.is_blocked) {
      throw new Error("Tutor is temporarily blocked by admin.");
    }

    const isPasswordMatch = await bcryptjs.compare(password, tutor.password);

    console.log("passmatch : ", isPasswordMatch);

    if (!isPasswordMatch) {
      throw new Error("Invalid password.");
    }

    const accessToken = generateAccessToken({
      id: tutor._id,
      email: tutor.email,
      role: "tutor",
    });

    const refreshToken = generateRefreshToken({
      id: tutor._id,
      email: tutor.email,
      role: "tutor",
    });

    const tutorWithToken = { ...tutor.toObject(), accessToken, refreshToken };

    return tutorWithToken;
  }

  public async googleSignin(token: string): Promise<ITutor> {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload?.email;

    if (!email) {
      throw new Error("Invalid Google token.");
    }

    const tutor = await this.tutorRepository.findTutor(email);

    if (!tutor) {
      throw new Error("User not found.");
    }

    if (tutor.is_blocked) {
      throw new CustomError(
        HttpStatusCodes.UNAUTHORIZED,
        "Tutor is temporarily blocked by admin"
      );
    }

    const accessToken = generateAccessToken({
      id: tutor._id,
      email: tutor.email,
      role: "tutor",
    });
    const refreshToken = generateRefreshToken({
      id: tutor._id,
      email: tutor.email,
      role: "tutor",
    });

    const tutorWithToken = { ...tutor.toObject(), accessToken, refreshToken };

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

  public async getTutors(
    page: number,
    limit: number,
    searchTerm: string
  ): Promise<{
    tutors: ITutor[];
    totalPages: number;
    currentPage: number;
  }> {
    console.log("page in servuce ==>", page);

    const tutors = await this.tutorRepository.getTutors(
      page,
      limit,
      searchTerm
    );

    const totalCount = await this.tutorRepository.countTutors();

    return {
      tutors,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    };
  }

  public async toggleBlockTutor(tutorId: string): Promise<void> {
    const tutor = await this.tutorRepository.getTutorById(tutorId);

    if (!tutor) {
      throw new CustomError(HttpStatusCodes.NOT_FOUND, "Tutor not found!!!");
    }

    const newStatus = !tutor.is_blocked;

    await this.tutorRepository.updateTutorStatus(tutorId, newStatus);
  }

  public async fetchTutorInfo(tutorId: string): Promise<ITutor | null> {
      return await this.tutorRepository.getTutor(tutorId)
  }
}

export default TutorService;
