import { ITutor } from "./tutor.interface";

export interface ITutorRepository {
  findTutor(tutor_id: string): Promise<ITutor | null>;
  createTutor(tutorData: ITutor): Promise<ITutor>;
  totalTutorCount(): Promise<number>;
}
