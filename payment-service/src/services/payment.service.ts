import stripe from "stripe";
import { ICourseRepository } from "../interfaces/course.repository.interface";
import { IPaymentService } from "../interfaces/payment.service.interface";
import { IStudentRepository } from "../interfaces/student.repository.interface";

import { ICourse } from "../interfaces/course.interface";

class PaymentService implements IPaymentService {
  private studentRepository: IStudentRepository;
  private courseRepository: ICourseRepository;

  constructor(
    studentRepository: IStudentRepository,
    courseRepository: ICourseRepository
  ) {
    this.studentRepository = studentRepository;
    this.courseRepository = courseRepository;
  }

  public async createPayment(
    courseId: string,
    studentId: string
  ): Promise<string> {
    const course = await this.courseRepository.getCourse(courseId);
    if (!course) {
      throw new Error("Course not found");
    }

    const student = await this.studentRepository.findStudent(studentId);
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY as string);

    console.log("find course in createPayment svc======>", course);
    console.log("find student in createPayment svc======>", student);

    const lineItems = [
      {
        price_data: {
          currency: "INR",
          product_data: {
            name: course.title,
          },
          unit_amount: Math.floor(course.price * 100),
        },
        quantity: 1,
      },
    ];

    const frontendUrl = process.env.FRONTEND_URL as string;


    const session = await stripeInstance.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${frontendUrl}payment-success`,
      cancel_url: `${frontendUrl}payment-failed`,
      metadata: {
        userId: studentId,
        courseId: courseId,
      },
      customer_email: student?.email, 
      locale: 'auto', 
    });

    return session.id
  }

  public async getEnrolledCourses(studentId: string): Promise<ICourse[]> {
      return this.courseRepository.getEnrolledCourses(studentId)
  }
}

export default PaymentService;
