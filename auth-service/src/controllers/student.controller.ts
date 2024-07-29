import { Request, Response, NextFunction } from "express";
import StudentService from "../services/student.service";
import { OtpService } from "../services/otp.service";
import { CreateStudentDto, VerifyOtpDto } from "../dtos/student.dto";

class StudentController {
  private studentService = new StudentService();
  private otpService = new OtpService()

  public signup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const studentData: CreateStudentDto = req.body;

      if (studentData.password !== studentData.confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
      }

      const otp = await this.otpService.generateOtp(studentData.email)

      await this.otpService.storeUserDataWithOtp(studentData, otp)

      res.status(200).json({ message: "OTP sent successfully" });
    } catch (error) {
      next(error);
    }
  };

  public verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const verifyOtpData : VerifyOtpDto = req.body

        const isOtpValid = await this.otpService.verifyOtp(verifyOtpData.email, verifyOtpData.otp)

        if(isOtpValid){
            const studentData = await this.otpService.getUserDataByOtp(verifyOtpData.email, verifyOtpData.otp)
            const newStudent = await this.studentService
        }
    } catch (error) {
        next(error)
    }
  }
}

export default StudentController;
