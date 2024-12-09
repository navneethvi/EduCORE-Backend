import { INewStudent, IStudent } from "../interfaces/student.interface";
import { CreateStudentDto } from "../dtos/student.dto";
import { IStudentRepository } from "../interfaces/student.repository.interface";
import { IOtpService } from "../interfaces/otp.service.interface";

import bcryptjs from "bcryptjs";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";
import { sendMessage } from "../events/kafkaClient";
import { OAuth2Client } from "google-auth-library";

import { IStudentService } from "../interfaces/student.service.interface";
import CustomError from "@envy-core/common/build/errors/CustomError";
import { HttpStatusCodes } from "@envy-core/common";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

class StudentService implements IStudentService {
  private studentRepository: IStudentRepository
  private otpService: IOtpService

  constructor(studentRepository: IStudentRepository, otpService: IOtpService){
    this.studentRepository = studentRepository;
    this.otpService = otpService;
  }

  public async checkUserExists(studentData: CreateStudentDto): Promise<void> {
    if (studentData.password !== studentData.confirmPassword) {
      throw Error("Password do not match !!!");
    }

    const tutorExists = await this.studentRepository.findUser(
      studentData.email
    );

    if (tutorExists) {
      throw Error("Student with this email already exists !!!");
    }

    const otp = await this.otpService.generateOtp(studentData.email);

    if (!otp) {
      throw Error("Failed to generate otp");
    }

    await this.otpService.storeUserDataWithOtp(studentData, otp);
  }

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

    await sendMessage("student-created", { 
      _id: newStudent._id,
      name: newStudent.name,
      email: newStudent.email,
      phone: newStudent.phone,
      // password: newStudent.password,
      is_blocked: newStudent.is_blocked,
      interests: newStudent.interests,
      image: newStudent.image,
      following: newStudent.following
     });

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

    if (student.is_blocked) {
      throw new Error("Student is temporarily blocked by admin.");
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

    if (student.is_blocked) {
      throw new Error("Student is temporarily blocked by admin.");
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

  public async getStudents(
    page: number,
    limit: number,
    searchTerm: string
  ): Promise<{
    students: IStudent[];
    totalPages: number;
    currentPage: number;
  }> {
    console.log("page in servuce ==>", page);

    const students = await this.studentRepository.getStudents(
      page,
      limit,
      searchTerm
    );

    const totalCount = await this.studentRepository.countStudents(searchTerm);

    return {
      students,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    };
  }

  public async toggleBlockStudent(studentId: string): Promise<void> {
    const tutor = await this.studentRepository.getStudentById(studentId);

    if (!tutor) {
      throw new CustomError(HttpStatusCodes.NOT_FOUND, "Tutor not found!!!");
    }

    const newStatus = !tutor.is_blocked;

    await this.studentRepository.updateStudentStatus(studentId, newStatus);
  }

}

export default StudentService;
