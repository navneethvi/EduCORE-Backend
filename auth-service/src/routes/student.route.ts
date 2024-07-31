import { Router } from "express";
import StudentController from "../controllers/student.controller";
import { validateRegisterUser } from "../common/middlewares/validateRequest";

const router = Router();

const studentController = new StudentController();

//* Student Routes

router.post("/signup", validateRegisterUser, studentController.signup);
router.post("/verify-otp", studentController.verifyOtp);
router.post("/resend-otp", studentController.resendOtp)
router.post("/set-interests", studentController.updateInterests)

router.post('/signin', studentController.signin)
router.post('/recover-account', studentController.recoverAccount)
router.post("/verify-account", studentController.verifyOtpForAccRecovery)
router.post('/update-password', studentController.updatePassword)

export default router;
