import mongoose from "mongoose";

export interface IEnrollment extends Document {
  studentId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  status: string;
  tutorId: mongoose.Types.ObjectId; 
  amount: number;
  createdAt: Date;
  paymentSessionId: string;
}
