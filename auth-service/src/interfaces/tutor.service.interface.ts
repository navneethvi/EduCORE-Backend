import { CreateTutorDto } from "../dtos/tutor.dto";
import { ITutor } from "../interfaces/tutor.interface";

export interface ITutorService {
  createTutor(tutorData: CreateTutorDto): Promise<ITutor>;
  signinTutor(email: string, password: string): Promise<ITutor | null>;
  googleSignin(token: string): Promise<ITutor>;
  recoverAccount(email: string): Promise<void>;
  updatePassword(email: string, newPassword: string): Promise<void>;
  getTutors(
    page: number,
    limit: number,
    searchTerm: string
  ): Promise<{
    tutors: ITutor[];
    totalPages: number;
    currentPage: number;
  }>;
  checkUserExists(tutorData: CreateTutorDto): Promise<void>;
  toggleBlockTutor(tutorId: string): Promise<void>;
  fetchTutorInfo(tutorId:string): Promise<ITutor | null>;
}
