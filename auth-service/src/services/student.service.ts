import { INewStudent, IStudent } from "../interfaces/student.interface";
import StudentRepository from "../repositories/student.repository";
import { CreateStudentDto } from "../dtos/student.dto";

import bcryptjs from "bcryptjs";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";
import { sendMessage } from "../events/kafkaClient";
import { OtpService } from "./otp.service";
import { OAuth2Client } from "google-auth-library";

import { IStudentService } from "../interfaces/student.service.interface";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

class StudentService implements IStudentService {
  private studentRepository = new StudentRepository();
  private otpService = new OtpService();

  public async createStudent(studentData: CreateStudentDto): Promise<IStudent> {
    const hashedPassword = await bcryptjs.hash(studentData.password, 10);

    const studentInput: INewStudent = {
      name: studentData.name,
      email: studentData.email,
      phone: studentData.phone,
      password: hashedPassword,
      interests: studentData.interests || [],
      following: [],
      role: studentData.role || "student",
    };

    const newStudent = await this.studentRepository.createStudent(studentInput);

    await sendMessage("student-created", { email: newStudent.email });

    const accessToken = generateAccessToken({
      id: newStudent._id,
      email: newStudent.email,
      role: "student",
    });

    const refreshToken = generateRefreshToken({
      id: newStudent._id,
      email: newStudent.email,
      role: "student",
    });

    const studentWithToken = {
      ...newStudent.toObject(),
      accessToken,
      refreshToken,
    };

    return studentWithToken;
  }

  public async signinStudent(
    email: string,
    password: string
  ): Promise<IStudent | null> {
    const student = await this.studentRepository.findUser(email);

    if (!student) {
      throw new Error("Invalid email or password.");
    }

    const isPasswordMatch = await bcryptjs.compare(password, student.password);

    console.log("passmatch : ", isPasswordMatch);

    if (!isPasswordMatch) {
      throw new Error("Invalid password.");
    }

    const accessToken = generateAccessToken({
      id: student._id,
      email: student.email,
      role: "student",
    });

    const refreshToken = generateRefreshToken({
      id: student._id,
      email: student.email,
      role: "student",
    });

    const studentWithToken = {
      ...student.toObject(),
      accessToken,
      refreshToken,
    };

    return studentWithToken;
  }

  public async googleSignin(token: string): Promise<IStudent | null> {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload?.email;

    if (!email) {
      throw new Error("Invalid Google token.");
    }

    const student = await this.studentRepository.findUser(email);

    if (!student) {
      throw new Error("User not found.");
    }

    const accessToken = generateAccessToken({
      id: student._id,
      email: student.email,
      role: "student",
    });

    const refreshToken = generateRefreshToken({
      id: student._id,
      email: student.email,
      role: "student",
    });

    const studentWithToken = {
      ...student.toObject(),
      accessToken,
      refreshToken,
    };

    return studentWithToken;
  }

  public async recoverAccount(email: string): Promise<void> {
    console.log("email in service : ", email);

    const student = await this.studentRepository.findUser(email);

    if (!student) {
      throw new Error("User not found.");
    }

    await this.otpService.generateAccRecoverOtp(email);
  }

  public async updatePassword(
    email: string,
    newPassword: string
  ): Promise<void> {
    const student = await this.studentRepository.findUser(email);

    if (!student) {
      throw new Error("User not found.");
    }

    const hashedPassword = await bcryptjs.hash(newPassword, 10);

    student.password = hashedPassword;

    await student.save();

    await this.otpService.deleteOtp(email);
  }
}

export default StudentService;
