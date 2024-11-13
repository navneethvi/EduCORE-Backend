import { Request, Response, NextFunction } from "express";
import { IPaymentService } from "../interfaces/payment.service.interface";
import dotenv from "dotenv";
dotenv.config();

class PaymentController {
  private paymentService: IPaymentService;

  constructor(paymentService: IPaymentService) {
    this.paymentService = paymentService;
  }
  public createPayment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      console.log("createPayment=========>", req.body);
      const { courseId, studentId } = req.body;
      const sessionId = await this.paymentService.createPayment(
        courseId,
        studentId
      );

      res.status(200).json({ sessionId });
    } catch (error) {
      next(error);
    }
  };

  public getEnrolledCourses = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    console.log("hitted");

    try {
      console.log(req.body);

      const { studentId } = req.body;
      console.log(
        "contrler is ready to fetch enrolled course =======>",
        studentId
      );
      const courses = await this.paymentService.getEnrolledCourses(studentId);

      console.log("courses=======>", courses);

      return courses;
    } catch (error) {
      next(error);
    }
  };
}

export default PaymentController;
