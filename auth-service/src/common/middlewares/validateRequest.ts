import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";

export const validateRegisterUser = [
  body("name").isString().withMessage("Name is required and must be a string"),
  body("email").isEmail().withMessage("Invalid email format"),
  body("phone")
    .isNumeric()
    .matches(/^\d{10}$/)
    .withMessage("Phone is required and must be exactly 10 digits"),
  body("password")
    .isString()
    .isLength({ min: 8 })
    .withMessage("Password is required and must be at least 4 characters long"),
  body("confirmPassword")
    .isString()
    .isLength({ min: 8 })
    .withMessage("Confirm password is required and must be at least 4 characters long"),
  body("role")
    .isIn(["student", "tutor", "admin"])
    .withMessage("Role must be one of: student, tutor, admin"),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
