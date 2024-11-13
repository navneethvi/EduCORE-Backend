import { Router } from "express";

import PaymentController from "../controller/payment.controller";

import StudentRepository from "../repositories/student.repository";
import CourseRepository from "../repositories/course.repository";


// import Tutor from "../models/tutor.model";
import Student from "../models/student.model";
import Enrollment from "../models/enrollment.model";
// import Admin from "../models/admin.model";


// import {
//     validateRegisterUser,
//     isTutorLogin,
//     isStudentLogin,
//     isAdminLogin,
//   } from "@envy-core/common";

import PaymentService from "../services/payment.service";
import Course from "../models/course.model";


const router = Router();

const studentRepository = new StudentRepository(Student)

const courseRepository = new CourseRepository(Course, Enrollment)

const paymentService = new PaymentService(studentRepository, courseRepository)

const paymentController = new PaymentController(paymentService)

router.post('/create-payment-intent', paymentController.createPayment)

router.post('/get-enrolled-courses', paymentController.getEnrolledCourses)

export default router
