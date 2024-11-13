import { ICourse } from "./course.interface";

export interface IPaymentService {
  createPayment(courseId: string, studentId: string): Promise<string>;
  getEnrolledCourses(studentId: string): Promise<ICourse[]>;
}
