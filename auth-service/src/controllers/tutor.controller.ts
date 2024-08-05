import { Request, Response, NextFunction } from "express";
import TutotService from "../services/tutor.service";
import TutorRepository from "../repositories/tutor.repository";

import { CreateTutorDto } from "../dtos/tutor.dto";
import { OtpService } from "../services/otp.service";
import { VerifyOtpDto } from "../dtos/student.dto";

class TutorController {
  private tutorService = new TutotService();
  private tutorRepository = new TutorRepository();
  private otpService = new OtpService();

  public signup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tutorData: CreateTutorDto = req.body;

      console.log("Req body : =>", req.body);
      

      if (tutorData.password !== tutorData.confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
      }

      const tutorExists = await this.tutorRepository.findTutor(tutorData.email);

      if (tutorExists) {
        return res
          .status(400)
          .json({ message: "Tutor with this email already exists" });
      }

      const otp = await this.otpService.generateOtp(tutorData.email);

      await this.otpService.storeUserDataWithOtp(tutorData, otp);

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

      console.log("verify otp data ===>", verifyOtpData);
      

      const isOtpValid = await this.otpService.verifyOtp(
        verifyOtpData.email,
        verifyOtpData.otp
      );

      if (isOtpValid) {
        const tutorData = await this.otpService.getUserDataByOtp(
          verifyOtpData.email,
          verifyOtpData.otp
        );

        if (!tutorData) {
          return res.status(400).json({ message: "Tutor data not found" });
        }

        console.log("tutorData from redis : ", tutorData);

        const newTutor = await this.tutorService.createTutor(tutorData);

        await this.otpService.deleteUserOtpAndData(
          verifyOtpData.email,
          verifyOtpData.otp
        );

        res.status(201).json({
          message: "Tutor registered successfully",
          tutorData: newTutor,
        });
      } else {
        res.status(400).json({ message: "Invalid OTP" });
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

      const existingTutor = await this.otpService.getUserDataByOtp(email);
      console.log(existingTutor, "==> userdata from redis");
      if (!existingTutor) {
        return res.status(400).json({
          message: "User with this email does not exist or OTP expired",
        });
      }

      const otp = await this.otpService.generateOtp(email);

      await this.otpService.storeUserDataWithOtp(existingTutor, otp);

      res.status(200).json({ message: "OTP resent successfully" });
    } catch (error) {
      next(error);
    }
  };

  public signin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {email, password} = req.body
        console.log(req.body);

        if (!email || !password) {
          return res
            .status(400)
            .json({ message: "Email and password are required." });
        }

        const tutor = await this.tutorService.signinTutor(email, password)

        console.log("Tutor in controller : ", tutor);
        
        res.status(200).json({ message: "Signin successful", tutor });
    } catch (error) {
        next(error)
    }
  }

  public recoverAccount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {email} = req.body
      
      await this.tutorService.recoverAccount(email)

      res.status(200).json({ message: 'OTP sent to your email.' })
    } catch (error) {
      next(error)
    }
  }

  public verifyOtpForAccRecovery = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {email, otp} = req.body
      
      if (!email || !otp) {
        return res.status(400).json({ message: 'Email and OTP are required.' });
      }

      const isValid = await this.otpService.verifyOtp(email, otp)

      if (isValid) {
        return res.status(200).json({ message: 'OTP verified.', isValid });
      } else {
        return res.status(400).json({ message: 'Invalid OTP.', isValid });
      }

    } catch (error) {
      next(error)
    }
  }

  public updatePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {email, otp, newPassword, confirmNewPassword} = req.body
      
      if(newPassword !== confirmNewPassword){
        throw new Error("Invalid Password.");
      }

      const isValid = await this.otpService.verifyOtp(email, otp)

      if (!isValid) {
        throw new Error("Invalid or expired OTP.");
      }

      await this.tutorService.updatePassword(email, newPassword)

      res.status(200).json({ message: "Password updated successfully." });
    } catch (error) {
      next(error)
    }
  }
}

export default TutorController;
