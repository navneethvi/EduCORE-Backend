import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { configDotenv } from "dotenv";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import Router from "./router/payment.routes";
import { ErrorHandler } from "@envy-core/common";
import { stripe } from "./config/stripe";
import Enrollment from "./models/enrollment.model";
import mongoose from "mongoose";

const app = express();

configDotenv();

app.use(cookieParser());

app.use("/api/payment/webhook", bodyParser.raw({ type: "application/json" }));
app.post(
  "/api/payment/webhook",
  async (req: Request, res: Response, next: NextFunction) => {
    const sig = req.headers["stripe-signature"] as string;
    const rawBody = req.body;

    try {
      const event = stripe.webhooks.constructEvent(
        rawBody,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET as string
      );

      if (event.type === "checkout.session.completed") {
        const session = event.data.object; // Stripe Checkout Session object

        const paymentData = {
          sessionId: session.id,
          paymentIntent: session.payment_intent,
          customerEmail: session.customer_email,
          amountTotal: session.amount_total,
          currency: session.currency,
          paymentStatus: session.payment_status,
          metadata: session.metadata,
        };

        const enrollmentData = {
          studentId: paymentData.metadata?.userId
            ? new mongoose.Types.ObjectId(paymentData.metadata.userId as string)
            : null,
          courseId: paymentData.metadata?.courseId
            ? new mongoose.Types.ObjectId(
                paymentData.metadata.courseId as string
              )
            : null,
          status: paymentData.paymentStatus === "paid" ? "success" : "failed",
          amount: paymentData.amountTotal ? paymentData.amountTotal / 100 : 0,
          createdAt: new Date(),
          paymentSessionId: paymentData.sessionId, // Include the sessionId
        };

        if (!enrollmentData.studentId || !enrollmentData.courseId) {
          console.error(
            "Error: Missing studentId or courseId in payment metadata"
          );
          return res.status(400).json({ error: "Invalid enrollment data" });
        }

        // Check for existing enrollment
        const existingEnrollment = await Enrollment.findOne({
          studentId: enrollmentData.studentId,
          courseId: enrollmentData.courseId,
        });

        if (existingEnrollment) {
          console.log("Enrollment already exists:", existingEnrollment);

          // Optionally update the existing enrollment with the sessionId
          await Enrollment.updateOne(
            { _id: existingEnrollment._id },
            { $set: { paymentSessionId: paymentData.sessionId, status: 'success' } }
          );

          return res.status(200).json({
            received: true,
            status: "already_enrolled",
            message: "Enrollment already exists",
          });
        }

        await Enrollment.create(enrollmentData);
        console.log("Enrollment saved to database:", enrollmentData);


        return res.status(200).json({
          received: true,
          status: "enrollment_created",
          message: "Enrollment successfully created",
        });
      }

      res.status(400).json({ error: "Event type not handled" });
    } catch (error) {
      console.error(`Error processing webhook: ${error}`);
      next(error);
    }
  }
);

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/payment", Router);

app.use(ErrorHandler.handleError);

export default app;
