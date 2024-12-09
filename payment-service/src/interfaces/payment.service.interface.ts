import { ICourse } from "./course.interface";
import { IEnrollment } from "./enrollment.interface";

export interface IPaymentService {
  createPayment(courseId: string, studentId: string): Promise<string>;
  isCourseAlreadyEnrolled(
    courseId: string,
    studentId: string
  ): Promise<boolean>;
  getEnrolledCourses(studentId: string): Promise<ICourse[]>;
  isStudentEnrolled(courseId: string, studentId: string): Promise<boolean>;
  getAdminStats(
    groupByFormat: string
  ): Promise<{ courses: ICourse[]; enrollments: IEnrollment[] }>;
  getTutorStats(
    tutorId: string,
    groupByFormat: string
  ): Promise<{ courses: ICourse[]; enrollments: IEnrollment[] }>;
  getNumOfEnrollsByTutor(tutorId: string): Promise<number>;
  getTotalSalesByTutor(tutorId: string): Promise<number>;
  last4WeeksEnrollments(
    tutorId: string
  ): Promise<{ enrollments: IEnrollment[] }>;
}
