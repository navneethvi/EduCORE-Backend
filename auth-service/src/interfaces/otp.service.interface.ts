import { CreateStudentDto } from "../dtos/student.dto";
import { CreateTutorDto } from "../dtos/tutor.dto";

export interface IOtpService {
  generateOtp(email: string): Promise<string>;
  storeUserDataWithOtp(
    userData: CreateStudentDto | CreateTutorDto,
    otp: string
  ): Promise<void>;
  verifyOtp(email: string, otp: string): Promise<boolean>;
  getUserDataByOtp(
    email: string,
    otp?: string
  ): Promise<CreateStudentDto | CreateTutorDto>;
  storeVerifiedUserData(
    email: string,
    userData: CreateStudentDto | CreateTutorDto
  ): Promise<void>;
  getVerifiedUserData(email: string): Promise<CreateStudentDto>;
  deleteUserOtpAndData(email: string, otp: string): Promise<void>;
  deleteVerifiedUserData(email: string): Promise<void>;
  generateAccRecoverOtp(email: string): Promise<string>;
  deleteOtp(email: string): Promise<void>;
}
