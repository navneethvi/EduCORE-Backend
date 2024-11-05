import { ITutor } from "./tutor.interface";

export interface IConsumerService {
    createTutor(tutorData: ITutor): Promise<void>;
}