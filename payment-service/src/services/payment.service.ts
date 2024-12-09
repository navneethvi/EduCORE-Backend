import { createStripeCustomer, stripe } from "../config/stripe";
import { ICourseRepository } from "../interfaces/course.repository.interface";
import { IPaymentService } from "../interfaces/payment.service.interface";
import { IStudentRepository } from "../interfaces/student.repository.interface";
import { IPaymentRepository } from "../interfaces/payment.repository.interface";
import { ICourse } from "../interfaces/course.interface";
import { IEnrollment } from "../interfaces/enrollment.interface";

class PaymentService implements IPaymentService {
  private studentRepository: IStudentRepository;
  private courseRepository: ICourseRepository;
  private paymentRepository: IPaymentRepository;

  constructor(
    studentRepository: IStudentRepository,
    courseRepository: ICourseRepository,
    paymentRepository: IPaymentRepository
  ) {
    this.studentRepository = studentRepository;
    this.courseRepository = courseRepository;
    this.paymentRepository = paymentRepository;
  }

  public async createPayment(
    courseId: string,
    studentId: string
  ): Promise<string> {
    try {
      console.log("Starting createPayment service...");

      const customers = await stripe.customers.list({
        limit: 100, // Adjust the limit based on your needs
      });

      // Filter customers by studentId in metadata
      const filteredCustomers = customers.data.filter(
        (customer) => customer.metadata?.studentId === studentId
      );

      let customerId: string;
      if (filteredCustomers.length > 0) {
        customerId = filteredCustomers[0].id; // Use the first matching customer
      } else {
        customerId = await createStripeCustomer(studentId);
      }

      const isEnrolled = await this.isCourseAlreadyEnrolled(
        courseId,
        studentId
      );
      console.log("Is already enrolled:", isEnrolled);

      if (isEnrolled) {
        throw new Error("You are already enrolled in this course.");
      }

      await this.cancelIncompleteCheckoutSessions(studentId);
      console.log(
        "Canceled incomplete checkout sessions for student:",
        studentId
      );

      // Check if a session already exists for the course and student
      const existingSession = await this.paymentRepository.getPaymentSession(
        studentId,
        courseId
      );

      if (existingSession) {
        console.log(
          "Payment session already exists, redirecting to payment page..."
        );
        return existingSession.sessionId;
      }

      const course = await this.courseRepository.getCourse(courseId);
      console.log("Course fetched from repository:", course);

      if (!course) {
        throw new Error("Course not found");
      }

      const student = await this.studentRepository.findStudent(studentId);
      console.log("Student fetched from repository:", student);

      if (!student) {
        throw new Error("Student not found");
      }

      const lineItems = [
        {
          price_data: {
            currency: "INR",
            product_data: {
              name: course.title,
            },
            unit_amount: Math.floor(course.price * 100), // Convert price to cents
          },
          quantity: 1,
        },
      ];

      const frontendUrl = process.env.FRONTEND_URL as string;
      const idempotencyKey = `payment-${studentId}-${courseId}-${Date.now()}`;

      const session = await stripe.checkout.sessions.create(
        {
          payment_method_types: ["card"],
          line_items: lineItems,
          mode: "payment",
          customer: customerId,
          success_url: `${frontendUrl}payment-success?courseId=${courseId}&studentId=${studentId}`,
          cancel_url: `${frontendUrl}payment-failed`,
          metadata: {
            userId: studentId,
            courseId: courseId,
          },
          locale: "auto",
        },
        {
          idempotencyKey: idempotencyKey,
        }
      );

      await this.paymentRepository.createPaymentSession(
        studentId,
        courseId,
        course?.tutor_id as string,
        "pending",
        course?.price,
        session.id
      );

      return session.id;
    } catch (error) {
      console.error("Error in createPayment service:", error);
      throw error;
    }
  }

  public async cancelIncompleteCheckoutSessions(studentId: string) {
    try {
      const customers = await stripe.customers.list({
        limit: 100, // Fetch up to 100 customers, adjust as necessary
      });

      // Filter the customers by studentId in metadata
      const filteredCustomers = customers.data.filter(
        (customer) => customer.metadata?.studentId === studentId
      );

      let customerId: string;
      if (filteredCustomers.length > 0) {
        customerId = filteredCustomers[0].id;
      } else {
        customerId = await createStripeCustomer(studentId);
      }

      // List sessions associated with the customer
      let sessions = await stripe.checkout.sessions.list({
        customer: customerId,
        limit: 5, // Adjust the limit based on your needs
      });

      let allSessions = sessions.data;

      // If there are more than 5 sessions, handle pagination
      while (sessions.has_more) {
        const nextPage = await stripe.checkout.sessions.list({
          customer: customerId,
          starting_after: sessions.data[sessions.data.length - 1].id,
          limit: 5,
        });

        allSessions = allSessions.concat(nextPage.data); // Append new data to allSessions
        sessions = nextPage; // Move to the next page of sessions
      }

      // Expire any unpaid sessions
      for (const session of allSessions) {
        if (session.payment_status === "unpaid" && session.status === "open") {
          await stripe.checkout.sessions.expire(session.id);
          console.log(`Expired session: ${session.id}`);
        } else if (session.status === "expired") {
          console.log(`Session ${session.id} is already expired.`);
        }
      }
    } catch (error) {
      console.error("Error in cancelIncompleteCheckoutSessions:", error);
      throw error;
    }
  }

  public async isCourseAlreadyEnrolled(
    courseId: string,
    studentId: string
  ): Promise<boolean> {
    const enrolledCourses = await this.getEnrolledCourses(studentId);
    console.log("enrolledCourses===>", enrolledCourses);

    return enrolledCourses.some((course) => course._id.toString() === courseId);
  }

  public async getEnrolledCourses(studentId: string): Promise<ICourse[]> {
    return this.courseRepository.getEnrolledCourses(studentId);
  }

  public async isStudentEnrolled(
    courseId: string,
    studentId: string
  ): Promise<boolean> {
    return this.paymentRepository.isStudentEnrolled(courseId, studentId);
  }

  public async getAdminStats(
    groupByFormat: string
  ): Promise<{ courses: ICourse[]; enrollments: IEnrollment[] }> {
    return await this.courseRepository.getStatsForAdmin(groupByFormat);
  }

  public async getNumOfEnrollsByTutor(tutorId: string): Promise<number> {
    return await this.paymentRepository.numOfEnrollmentsByTutor(tutorId);
  }

  public async getTotalSalesByTutor(tutorId: string): Promise<number> {
      return await this.paymentRepository.totalSalesByTutor(tutorId)
  }

  public async getTutorStats(tutorId: string, groupByFormat: string): Promise<{ courses: ICourse[]; enrollments: IEnrollment[]; }> {
      return await this.courseRepository.getStatsForTutor(tutorId, groupByFormat)
  }

  public async last4WeeksEnrollments(tutorId: string): Promise<{ enrollments: IEnrollment[]; }> {
      return await this.paymentRepository.last4WeeksEnrollments(tutorId)
  }
}

export default PaymentService;
