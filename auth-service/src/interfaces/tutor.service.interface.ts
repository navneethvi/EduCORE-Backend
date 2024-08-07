import { CreateTutorDto } from "../dtos/tutor.dto";
import { ITutor } from "../interfaces/tutor.interface";

export interface ITutorService {
  createTutor(tutorData: CreateTutorDto): Promise<ITutor>;
  signinTutor(email: string, password: string): Promise<ITutor | null>;
  recoverAccount(email: string): Promise<void>;
  updatePassword(email: string, newPassword: string): Promise<void>;
}
