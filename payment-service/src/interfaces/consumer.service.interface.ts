import { CourseDocument } from "../models/course.model";
import { IStudent } from "./student.interface";
import { ITutor } from "./tutor.interface";

export interface IConsumerService {
  createStudent(studentData: IStudent): Promise<void>;
  createCourse(courseData: Partial<CourseDocument>): Promise<void>;
  findCourse(courseId: string): Promise<boolean>;
  updateCourse(courseData: Partial<CourseDocument>): Promise<void>;
  createTutor(tutorData: ITutor): Promise<void>
}
