import { Request, Response, NextFunction } from "express";
import { IPaymentService } from "../interfaces/payment.service.interface";
import dotenv from "dotenv";
import { HttpStatusCodes, logger } from "@envy-core/common";
dotenv.config();

interface TutorRequest extends Request {
  tutor?: string;
}

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

      // Log input values
      console.log("Course ID:", courseId);
      console.log("Student ID:", studentId);

      const isEnrolled = await this.paymentService.isCourseAlreadyEnrolled(
        courseId,
        studentId
      );

      // Log enrollment status
      console.log("Enrollment check:", isEnrolled);

      if (isEnrolled) {
        return res
          .status(409)
          .json({ message: "You are already enrolled in this course." });
      }

      const sessionId = await this.paymentService.createPayment(
        courseId,
        studentId
      );

      // Log the session ID generated
      console.log("Stripe session ID:", sessionId);

      res.status(HttpStatusCodes.CREATED).json({ sessionId });
    } catch (error) {
      console.error("Error in createPayment controller:", error);
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

      // console.log("courses=======>", courses);

      res.status(HttpStatusCodes.OK).json(courses);
    } catch (error) {
      next(error);
    }
  };

  public getEnrollmentStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { courseId, studentId } = req.body;

      if (!courseId || !studentId) {
        return res.status(400).json({
          success: false,
          message: "Missing courseId or studentId",
        });
      }

      // Example logic for checking enrollment status
      const isEnrolled = await this.paymentService.isStudentEnrolled(
        courseId,
        studentId
      );

      if (isEnrolled) {
        return res.status(200).json({
          success: true,
          status: "success",
          message: "Student is already enrolled",
        });
      } else {
        return res.status(200).json({
          success: true,
          status: "not_enrolled",
          message: "Student is not enrolled",
        });
      }
    } catch (error) {
      // Pass any unexpected error to the error handler
      next(error);
    }
  };

  public getStatsForAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      logger.info("im here to fetch the dashboard stats for admin");
      const { timeRange } = req.query;

      const groupByFormat =
        timeRange === "weekly"
          ? "%Y-%U" // Year and Week
          : timeRange === "monthly"
          ? "%Y-%m" // Year and Month
          : "%Y"; // Year

      const stats = await this.paymentService.getAdminStats(groupByFormat);

      console.log("stats========>", stats);
      res.status(HttpStatusCodes.OK).json(stats);
    } catch (error) {
      next(error);
    }
  };

  public getStatsForTutor = async (
    req: TutorRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      logger.info("im here to fetch the dashboard stats for tutor");
      const { timeRange } = req.query;
      const tutorId = req.tutor as string;

      const groupByFormat =
        timeRange === "weekly"
          ? "%Y-%U" // Year and Week
          : timeRange === "monthly"
          ? "%Y-%m" // Year and Month
          : "%Y"; // Year

      const stats = await this.paymentService.getTutorStats(
        tutorId,
        groupByFormat
      );

      console.log("stats========>", stats);
      res.status(HttpStatusCodes.OK).json(stats);
    } catch (error) {
      next(error);
    }
  };

  public getTutorDashboardDatas = async (
    req: TutorRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      logger.warn("im here for fetching tutor dashboard infos");
      const tutorId = req.tutor as string;
      console.log("tutorId", tutorId);

      const numOfEnrolls = await this.paymentService.getNumOfEnrollsByTutor(
        tutorId
      );
      console.log("num of enrolls===>", numOfEnrolls);
      const totalSales = await this.paymentService.getTotalSalesByTutor(
        tutorId
      );
      console.log("total of sales===>", totalSales);

      res.status(HttpStatusCodes.OK).json({ numOfEnrolls, totalSales });
    } catch (error) {
      next(error);
    }
  };

  public getLast4WeeksStats = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { tutorId } = req.params;
      const response = await this.paymentService.last4WeeksEnrollments(tutorId);
      console.log("response====>", response);

      res.status(HttpStatusCodes.OK).json(response);
    } catch (error) {
      next(error);
    }
  };
}

export default PaymentController;
