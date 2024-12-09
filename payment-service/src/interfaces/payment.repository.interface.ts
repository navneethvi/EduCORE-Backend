import { IEnrollment } from "./enrollment.interface";

export interface IPaymentRepository {
  createEnrollment(enrollmentData: IEnrollment): Promise<IEnrollment | null>;
  isStudentEnrolled(courseId: string, studentId: string): Promise<boolean>;
  createPaymentSession(
    studentId: string,
    courseId: string,
    tutorId: string,
    status: string,
    amount: number,
    sessionId: string
  ): Promise<void>;
  getPaymentSession(
    studentId: string,
    courseId: string
  ): Promise<{ sessionId: string } | null>;
  numOfEnrollmentsByTutor(tutorId: string): Promise<number>;
  totalSalesByTutor(tutorId: string): Promise<number>;
  last4WeeksEnrollments(
    tutorId: string
  ): Promise<{ enrollments: IEnrollment[] }>;
}
