import { ITutor } from "./tutor.interface";

export interface ITutorService {
  findTutor(tutor_id: string): Promise<ITutor | null>;
  totalTutorCount(): Promise<number>
}
