import { Router } from "express";

import PaymentController from "../controller/payment.controller";

// import Tutor from "../models/tutor.model";
// import Student from "../models/student.model";
// import Admin from "../models/admin.model";


// import {
//     validateRegisterUser,
//     isTutorLogin,
//     isStudentLogin,
//     isAdminLogin,
//   } from "@envy-core/common";

const router = Router();

const paymentController = new PaymentController()

router.post('/create-payment-intent', paymentController.createPayment)

export default router