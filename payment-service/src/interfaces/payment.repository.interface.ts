import { IEnrollment } from "./enrollment.interface";

export interface IPaymentRepository {
  createEnrollment(enrollmentData: IEnrollment): Promise<IEnrollment | null>;
}


