import { IEnrollment } from "../interfaces/enrollment.interface";
import { Model, Types } from "mongoose";
import { IPaymentRepository } from "../interfaces/payment.repository.interface";

class PaymentRepository implements IPaymentRepository {
  private readonly enrollmentModel: Model<IEnrollment>;

  constructor(enrollmentModel: Model<IEnrollment>) {
    this.enrollmentModel = enrollmentModel;
  }

  public async createEnrollment(
    enrollmentData: IEnrollment
  ): Promise<IEnrollment | null> {
    console.log("enrollmentdata====>",enrollmentData);
    
    return this.enrollmentModel.create(enrollmentData);
  }

  public async isStudentEnrolled(
    courseId: string,
    studentId: string
  ): Promise<boolean> {
    const enrollment = await this.enrollmentModel.findOne({
      studentId: studentId,
      courseId: courseId,
      status: "success",
    });

    return !!enrollment;
  }

  public async getPaymentSession(
    studentId: string,
    courseId: string
  ): Promise<{ sessionId: string } | null> {
    const session = await this.enrollmentModel.findOne({
      studentId: studentId,
      courseId: courseId,
      paymentStatus: "pending", // Ensure you're checking for pending or ongoing payments
    });
  
    return session ? { sessionId: session.paymentSessionId } : null;
  }
  
  
  public async createPaymentSession(
    studentId: string,
    courseId: string,
    tutorId: string,
    status: string,
    amount: number,
    sessionId: string
  ): Promise<void> {
    await this.enrollmentModel.updateOne(
      { studentId: studentId, courseId: courseId, tutorId: tutorId, amount: amount },
      { 
        $set: {
          paymentSessionId: sessionId,
          status: "pending", 
        }
      },
      { upsert: true }
    );
  }
  
  public async numOfEnrollmentsByTutor(tutorId: string): Promise<number> {
      return await this.enrollmentModel.find({tutorId: tutorId, status: "success"}).countDocuments()
  }

  public async totalSalesByTutor(tutorId: string): Promise<number> {
    try {
      const result = await this.enrollmentModel.aggregate([
        {
          $match: {
            tutorId: new Types.ObjectId(tutorId), 
            status: "success", 
          },
        },
        {
          $group: {
            _id: null,
            totalSales: { $sum: "$amount" }, 
          },
        },
      ]);

      console.log("result---->", result);
      
  
      return result.length > 0 ? result[0].totalSales : 0;
    } catch (error) {
      console.error("Error calculating total sales by tutor:", error);
      throw new Error("Could not calculate total sales");
    }
  }

  public async last4WeeksEnrollments(tutorId: string): Promise<{ enrollments: IEnrollment[]; }> {
    const currentDate = new Date();
    const startDate = new Date(currentDate.setMonth(currentDate.getMonth() - 1)); // Set start date to 4 weeks ago

    // Aggregate data by week for the last 4 weeks
    const enrollments = await this.enrollmentModel.aggregate([
      {
        $match: {
          tutorId: tutorId,
          createdAt: { $gte: startDate },
        },
      },
      {
        $project: {
          week: {
            $isoWeek: "$createdAt", // Get the ISO week number
          },
          status: 1, // You can modify this if you want to include more fields
        },
      },
      {
        $group: {
          _id: "$week",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: -1 }, // Sort by week in descending order (latest first)
      },
      {
        $limit: 4, // Limit to the last 4 weeks
      },
    ]);

    const reversedEnrollments = enrollments.reverse();


    const result = reversedEnrollments.map((item) => item.count);

    return { enrollments: result };
  }
  
}

export default PaymentRepository;
