import { Request, Response, NextFunction } from "express";
import StudentRepository from "../repositories/student.repository";
import StudentService from "../services/student.service";
import { OtpService } from "../services/otp.service";
import { CreateStudentDto, VerifyOtpDto } from "../dtos/student.dto";

import { HttpStatusCodes } from "@envy-core/common";

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
          .status(HttpStatusCodes.BAD_REQUEST)
          .json({ message: "Student with this email already exists" });
      }

      const otp = await this.otpService.generateOtp(studentData.email);

      await this.otpService.storeUserDataWithOtp(studentData, otp);

      res.status(HttpStatusCodes.OK).json({ message: "OTP sent successfully" });
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

      console.log("verifyotpdata ===>", verifyOtpData);

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

        await this.otpService.deleteUserOtpAndData(
          verifyOtpData.email,
          verifyOtpData.otp
        );

        await this.otpService.storeVerifiedUserData(
          verifyOtpData.email,
          studentData
        );

        res.status(HttpStatusCodes.OK).json({
          message: "OTP Verified, Please Update Interests",
        });
      } else {
        res
          .status(HttpStatusCodes.BAD_REQUEST)
          .json({ message: "Invalid OTP" });
      }
    } catch (error) {
      next(error);
    }
  };

  public resendOtp = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { email } = req.body;
      console.log(email, "==> email");

      const existingStudent = await this.otpService.getUserDataByOtp(email);
      console.log(existingStudent, "==> userdata from redis");
      if (!existingStudent) {
        return res.status(HttpStatusCodes.BAD_REQUEST).json({
          message: "User with this email does not exist or OTP expired",
        });
      }

      const otp = await this.otpService.generateOtp(email);

      await this.otpService.storeUserDataWithOtp(existingStudent, otp);

      res
        .status(HttpStatusCodes.OK)
        .json({ message: "OTP resent successfully" });
    } catch (error) {
      next(error);
    }
  };

  public updateInterests = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { email, interests } = req.body;

      const studentData = await this.otpService.getVerifiedUserData(email);

      if (!studentData) {
        return res
          .status(HttpStatusCodes.BAD_REQUEST)
          .json({ message: "Student data not found" });
      }

      studentData.interests = interests;

      const newStudent = await this.studentService.createStudent(studentData);

      const { refreshToken, ...student } = newStudent;

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      await this.otpService.deleteVerifiedUserData(email);

      res.status(HttpStatusCodes.CREATED).json({
        message: "Student registered successfully",
        studentData: student,
      });
    } catch (error) {
      next(error);
    }
  };

  public signin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      console.log(req.body);

      if (!email || !password) {
        return res
          .status(HttpStatusCodes.BAD_REQUEST)
          .json({ message: "Email and password are required." });
      }

      const student = await this.studentService.signinStudent(email, password);

      console.log("Student in controller: ", student);

      if (!student) {
        return res
          .status(HttpStatusCodes.UNAUTHORIZED)
          .json({ message: "Signin failed." });
      }

      const { refreshToken, ...studentData } = student;

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      res
        .status(HttpStatusCodes.OK)
        .json({ message: "Signin successful", studentData: studentData });
    } catch (error) {
      next(error);
    }
  };

  public googleSignin = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { token } = req.body;

    try {
      const student = await this.studentService.googleSignin(token);

      console.log("Student in controller: ", student);

      if (!student) {
        return res
          .status(HttpStatusCodes.UNAUTHORIZED)
          .json({ message: "Signin failed." });
      }

      const { refreshToken, ...studentData } = student;

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      res
        .status(HttpStatusCodes.OK)
        .json({ message: "Signin successful", studentData: studentData });
    } catch (error) {
      next(error);
    }
  };

  public recoverAccount = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { email } = req.body;

      await this.studentService.recoverAccount(email);

      res
        .status(HttpStatusCodes.OK)
        .json({ message: "OTP sent to your email." });
    } catch (error) {
      next(error);
    }
  };

  public verifyOtpForAccRecovery = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        return res.status(400).json({ message: "Email and OTP are required." });
      }

      const isValid = await this.otpService.verifyOtp(email, otp);

      if (isValid) {
        return res
          .status(HttpStatusCodes.OK)
          .json({ message: "OTP verified.", isValid });
      } else {
        return res
          .status(HttpStatusCodes.BAD_REQUEST)
          .json({ message: "Invalid OTP.", isValid });
      }
    } catch (error) {
      next(error);
    }
  };

  public updatePassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { email, otp, newPassword, confirmNewPassword } = req.body;

      if (newPassword !== confirmNewPassword) {
        throw new Error("Invalid Password.");
      }

      const isValid = await this.otpService.verifyOtp(email, otp);

      if (!isValid) {
        throw new Error("Invalid or expired OTP.");
      }

      await this.studentService.updatePassword(email, newPassword);

      res
        .status(HttpStatusCodes.OK)
        .json({ message: "Password updated successfully." });
    } catch (error) {
      next(error);
    }
  };

  public logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      console.log("token from logout ===>", authHeader);
      console.log("cookieees ===>", req.cookies);

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res
          .status(HttpStatusCodes.UNAUTHORIZED)
          .json({ message: "Authorization token is missing or invalid" });
      }

      const token = authHeader.split(" ")[1];

      console.log(token);

      res.clearCookie("refreshToken");

      res.status(HttpStatusCodes.OK).json({ message: "Logout successful" });
    } catch (error) {
      next(error);
    }
  };
}

export default StudentController;
