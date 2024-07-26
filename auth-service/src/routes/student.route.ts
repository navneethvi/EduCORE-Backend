import { Router } from "express";
import StudentController from "../controllers/student.controller";
import { CreateStudentDto } from "../dtos/student.dto";

const router = Router()

const studentController = new StudentController()


//* Student Routes

router.post('/signup', studentController.signup)

export default router;