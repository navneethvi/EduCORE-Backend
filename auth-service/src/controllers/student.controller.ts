import { Request, Response, NextFunction } from "express";
import StudentRepository from "../repositories/student.repository";
import StudentService from "../services/student.service";
import { OtpService } from "../services/otp.service";
import { CreateStudentDto, VerifyOtpDto } from "../dtos/student.dto";

class StudentController {
  private studentService = new StudentService();
  private otpService = new OtpService();
  private studentRepository = new StudentRepository();

  public signup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const studentData: CreateStudentDto = req.body;

      if (studentData.password !== studentData.confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
      }

      const existingStudent = await this.studentRepository.findUser(
        studentData.email
      );
      if (existingStudent) {
        return res
          .status(400)
          .json({ message: "User with this email already exists" });
      }

      const otp = await this.otpService.generateOtp(studentData.email);

      await this.otpService.storeUserDataWithOtp(studentData, otp);

      res.status(200).json({ message: "OTP sent successfully" });
    } catch (error) {
      next(error);
    }
  };

  public verifyOtp = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const verifyOtpData: VerifyOtpDto = req.body;

      const isOtpValid = await this.otpService.verifyOtp(
        verifyOtpData.email,
        verifyOtpData.otp
      );

      if (isOtpValid) {
        const studentData = await this.otpService.getUserDataByOtp(
          verifyOtpData.email,
          verifyOtpData.otp
        );

        console.log("studentData from redis : ", studentData);

        const newStudent = await this.studentService.createStudent(studentData);

        res
          .status(201)
          .json({
            message: "Student registered successfully",
            student: newStudent,
          });
      } else {
        res.status(400).json({ message: "Invalid OTP" });
      }
    } catch (error) {
      next(error);
    }
  };
}

export default StudentController;
