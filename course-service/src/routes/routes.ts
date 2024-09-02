import { Router } from "express";
import multer from "multer";

import { isTutorLogin } from "@envy-core/common";

const upload = multer({ storage: multer.memoryStorage() });

import CategoryController from "../controllers/category.controller";
import CourseController from "../controllers/course.controller";
import Tutor from "../models/tutor.model";
// import { isTutorLogin } from "@envy-core/common";

const router = Router();

const categoryController = new CategoryController();
const courseController = new CourseController();

// * Category Routes
router.post("/add_category", categoryController.addCategory);
router.get("/get_categories", categoryController.getCategories);
router.post("/delete_category", categoryController.deleteCategory);

// * Course Routes
router.post(
  "/add_course",
  isTutorLogin(Tutor),
  upload.any(),
  courseController.createCourse
);

router.get('/:tutorId/courses', courseController.getTutorCourses)

export default router;
