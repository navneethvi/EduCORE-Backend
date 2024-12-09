import { INewTutor, ITutor } from "./tutor.interface";

export interface ITutorRepository {
  findTutor(email: string): Promise<ITutor | null>;
  getTutor(email: string): Promise<ITutor | null> 
  createTutor(tutorData: INewTutor): Promise<ITutor>;
  getTutors(page?: number, limit?: number, searchTerm?: string): Promise<ITutor[]>;
  countTutors(searchTerm?: string): Promise<number>;
  updateTutorStatus(tutorId: string, is_blocked: boolean): Promise<void>;
  getTutorById(tutorId: string): Promise<ITutor | null>;
}
