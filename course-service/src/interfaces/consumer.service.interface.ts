import { IStudent } from "./student.interface";
import { ITutor } from "./tutor.interface";

export interface IConsumerService {
    createTutor(tutorData: ITutor): Promise<void>;
    createStudent(studentData: IStudent): Promise<void>;
    getStudentsCount(): Promise<number>;
}