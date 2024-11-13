import { IEnrollment } from "../interfaces/enrollment.interface";
import  { Model } from "mongoose";
import { IPaymentRepository } from "../interfaces/payment.repository.interface";


class PaymentRepository implements IPaymentRepository{
    private readonly enrollmentModel: Model<IEnrollment>;

    constructor(enrollmentModel: Model<IEnrollment>) {
      this.enrollmentModel = enrollmentModel;
    }

    public async createEnrollment(enrollmentData: IEnrollment): Promise<IEnrollment | null> {
        return this.enrollmentModel.create(enrollmentData)
    }
}

export default PaymentRepository