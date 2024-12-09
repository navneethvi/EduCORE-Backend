import { Router } from "express";

import PaymentController from "../controller/payment.controller";

import StudentRepository from "../repositories/student.repository";
import CourseRepository from "../repositories/course.repository";

import Tutor from "../models/tutor.model";
import Student from "../models/student.model";
import Enrollment from "../models/enrollment.model";
// import Admin from "../models/admin.model";


import PaymentService from "../services/payment.service";
import Course from "../models/course.model";
import PaymentRepository from "../repositories/payment.repository";
import { isTutorLogin } from "@envy-core/common";

const router = Router();

const studentRepository = new StudentRepository(Student);

const courseRepository = new CourseRepository(Course, Enrollment);

export const paymentRepository = new PaymentRepository(Enrollment);

const paymentService = new PaymentService(
  studentRepository,
  courseRepository,
  paymentRepository
);

const paymentController = new PaymentController(paymentService);

router.post("/create-payment-intent", paymentController.createPayment);

router.post("/get-enrolled-courses", paymentController.getEnrolledCourses);

router.post("/enrollment-status", paymentController.getEnrollmentStatus);

router.get("/admin-stats", paymentController.getStatsForAdmin)

router.get("/tutor-stats",isTutorLogin(Tutor), paymentController.getStatsForTutor)

router.get("/tutor-dash",isTutorLogin(Tutor), paymentController.getTutorDashboardDatas)

router.get("/tutor-enrollments", paymentController.getLast4WeeksStats)

export default router;
