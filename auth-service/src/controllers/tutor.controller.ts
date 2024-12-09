import { Request, Response, NextFunction } from "express";
import { CreateTutorDto } from "../dtos/tutor.dto";
import { VerifyOtpDto } from "../dtos/student.dto";
import { HttpStatusCodes } from "@envy-core/common";
import { ITutorService } from "../interfaces/tutor.service.interface";
import { IOtpService } from "../interfaces/otp.service.interface";

interface AdminRequest extends Request {
  admin?: unknown;
}

class TutorController {
  private tutorService: ITutorService;
  private otpService: IOtpService;

  constructor(tutorService: ITutorService, otpService: IOtpService) {
    this.tutorService = tutorService;
    this.otpService = otpService;
  }

  public signup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tutorData: CreateTutorDto = req.body;

      console.log("Req body : =>", req.body);

      await this.tutorService.checkUserExists(tutorData);

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
          return res
            .status(HttpStatusCodes.BAD_REQUEST)
            .json({ message: "Tutor data not found" });
        }

        console.log("tutorData from redis : ", tutorData);

        const newTutor = await this.tutorService.createTutor(tutorData);

        const { refreshToken, ...tutor } = newTutor;

        res.cookie("tutorRefreshToken", refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        await this.otpService.deleteUserOtpAndData(
          verifyOtpData.email,
          verifyOtpData.otp
        );

        res.status(HttpStatusCodes.CREATED).json({
          message: "Tutor registered successfully",
          tutorData: tutor,
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

      const existingTutor = await this.otpService.getUserDataByOtp(email);
      console.log(existingTutor, "==> userdata from redis");
      if (!existingTutor) {
        return res.status(HttpStatusCodes.BAD_REQUEST).json({
          message: "User with this email does not exist or OTP expired",
        });
      }

      const otp = await this.otpService.generateOtp(email);

      await this.otpService.storeUserDataWithOtp(existingTutor, otp);

      res
        .status(HttpStatusCodes.OK)
        .json({ message: "OTP resent successfully" });
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

      const tutor = await this.tutorService.signinTutor(email, password);

      console.log("Tutor in controller : ", tutor);

      if (!tutor) {
        return res
          .status(HttpStatusCodes.UNAUTHORIZED)
          .json({ message: "Signin failed." });
      }

      const { refreshToken, ...tutorData } = tutor;

      res.cookie("tutorRefreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      res
        .status(HttpStatusCodes.OK)
        .json({ message: "Signin successful", tutorData: tutorData });
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
      const tutor = await this.tutorService.googleSignin(token);

      const { refreshToken, ...tutorData } = tutor;

      res.cookie("tutorRefreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      console.log("Cookies:", req.cookies);

      res
        .status(HttpStatusCodes.OK)
        .json({ message: "Signin successful", tutorData });
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

      await this.tutorService.recoverAccount(email);

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
        return res
          .status(HttpStatusCodes.BAD_REQUEST)
          .json({ message: "Email and OTP are required." });
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

      await this.tutorService.updatePassword(email, newPassword);

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

      // await logoutTutorService(token);
      console.log(token);

      // Clear refresh token cookie if applicable
      res.clearCookie("refreshToken");

      res.status(HttpStatusCodes.OK).json({ message: "Logout successful" });
    } catch (error) {
      next(error);
    }
  };

  public getTutors = async (
    req: AdminRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // logger.info(req.admin);

      const page = parseInt(req.query.page as string) || 1;

      const limit = parseInt(req.query.limit as string) || 5;

      const searchTerm = req.query.searchTerm
        ? String(req.query.searchTerm)
        : "";

      console.log("Fetching tutors...", searchTerm);

      const students = await this.tutorService.getTutors(
        page,
        limit,
        searchTerm
      );

      res.json(students);
    } catch (error) {
      next(error);
    }
  };

  public blockTutors = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { tutorId } = req.params;
      console.log("hre");

      await this.tutorService.toggleBlockTutor(tutorId);

      res
        .status(HttpStatusCodes.OK)
        .json({ message: "Tutor block status updated successfully" });
    } catch (error) {
      next(error);
    }
  };

  public fetchTutorInfo = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      console.log(req.body);
      
      const { tutorId } = req.body;
      console.log("tutorId to fetch===>", tutorId);

      const response = await this.tutorService.fetchTutorInfo(tutorId);
      console.log(response);
      res.status(HttpStatusCodes.OK).json(response);
    } catch (error) {
      next(error);
    }
  };
}

export default TutorController;
