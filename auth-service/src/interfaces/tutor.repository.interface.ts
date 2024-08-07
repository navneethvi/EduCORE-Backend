import { INewTutor, ITutor } from "./tutor.interface";

export interface ITutorRepository {
  findTutor(email: string): Promise<ITutor | null>;
  createTutor(tutorData: INewTutor): Promise<ITutor>;
}
