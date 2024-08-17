import { Router } from "express";
import StudentController from "../controllers/student.controller";
import TutorController from "../controllers/tutor.controller";
import AdminController from "../controllers/admin.controller";

import Tutor from "../models/tutor.model";

import {
  validateRegisterUser,
  isTutorLogin,
  isStudentLogin,
} from "@envy-core/common";
import Student from "../models/student.model";

const router = Router();

const studentController = new StudentController();
const tutorController = new TutorController();
const adminController = new AdminController();

//* Student Routes

router.post("/signup", validateRegisterUser, studentController.signup);
router.post("/verify-otp", studentController.verifyOtp);
router.post("/resend-otp", studentController.resendOtp);
router.post("/set-interests", studentController.updateInterests);
router.post("/logout",isStudentLogin(Student), studentController.logout);

router.post("/signin", studentController.signin);
router.post("/google", studentController.googleSignin);
router.post("/recover-account", studentController.recoverAccount);
router.post("/verify-account", studentController.verifyOtpForAccRecovery);
router.post("/update-password", studentController.updatePassword);

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

//* Admin Routes

router.post("/admin/signin", adminController.signin);
router.get("/admin/get_students", studentController.getStudents)
router.get("/admin/get_tutors", tutorController.getTutors)

export default router;
