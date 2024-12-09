import mongoose, { Schema, model } from "mongoose";
import { IEnrollment } from "../interfaces/enrollment.interface";

const enrollmentSchema: Schema<IEnrollment> = new Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ["success", "failed", "pending"],
  },
  tutorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  amount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  paymentSessionId: { type: String },
});

const Enrollment = model<IEnrollment>("Enrollment", enrollmentSchema);

export default Enrollment;
