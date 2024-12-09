import { Router } from "express";
import StudentController from "../controllers/student.controller";
import AdminController from "../controllers/admin.controller";
import TutorController from "../controllers/tutor.controller";

import Tutor from "../models/tutor.model"; 
import Student from "../models/student.model";
import Admin from "../models/admin.model";

import {
  validateRegisterUser,
  isTutorLogin,
  isStudentLogin,
  isAdminLogin,
} from "@envy-core/common";

import TutorService from "../services/tutor.service";
import { OtpService } from "../services/otp.service";
import TutorRepository from "../repositories/tutor.repository";
import StudentService from "../services/student.service";
import StudentRepository from "../repositories/student.repository";
import AdminService from "../services/admin.service";
import AdminRepository from "../repositories/admin.repository";

const router = Router();

const tutorRepository = new TutorRepository(Tutor);
const studentRepository = new StudentRepository(Student);
const adminRepository = new AdminRepository(Admin);
const otpService = new OtpService();
const tutorService = new TutorService(tutorRepository, otpService);
const studentService = new StudentService(studentRepository, otpService);
const adminService = new AdminService(adminRepository);
const tutorController = new TutorController(tutorService, otpService);

const studentController = new StudentController(studentService, otpService);
const adminController = new AdminController(adminService);

//* Student Routes

router.post("/signup", validateRegisterUser, studentController.signup);
router.post("/verify-otp", studentController.verifyOtp);
router.post("/resend-otp", studentController.resendOtp);
router.post("/set-interests", studentController.updateInterests);
router.post("/logout", isStudentLogin(Student), studentController.logout);


router.post("/signin", studentController.signin);
router.post("/google", studentController.googleSignin);
router.post("/recover-account", studentController.recoverAccount);
router.post("/verify-account", studentController.verifyOtpForAccRecovery);
router.post("/update-password", studentController.updatePassword);
router.patch("/:studentId/block",isAdminLogin(Admin), studentController.blockStudents);

//* Tutor Routes

router.post("/tutor/signup", validateRegisterUser, tutorController.signup);
router.post("/tutor/verify-otp", tutorController.verifyOtp);
router.post("/tutor/resend-otp", tutorController.resendOtp);
router.post("/tutor/logout", isTutorLogin(Tutor), tutorController.logout);

router.post("/tutor/signin", tutorController.signin);
router.post("/tutor/google", tutorController.googleSignin);
router.post("/tutor/recover-account", tutorController.recoverAccount);
router.post("/tutor/verify-account", tutorController.verifyOtpForAccRecovery);
router.post("/tutor/update-password", tutorController.updatePassword);
router.patch("/tutor/:tutorId/block",isAdminLogin(Admin), tutorController.blockTutors);
router.post("/tutor/fetch-tutor", tutorController.fetchTutorInfo)


//* Admin Routes

router.post("/admin/signin", adminController.signin);
router.post("/admin/logout",isAdminLogin(Admin), adminController.logout)
router.get("/admin/get_students",isAdminLogin(Admin), studentController.getStudents);
router.get("/admin/get_tutors", isAdminLogin(Admin), tutorController.getTutors);

export default router;
