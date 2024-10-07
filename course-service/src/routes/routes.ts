import { Router } from "express";
import multer from "multer";

import { isTutorLogin } from "@envy-core/common";

const upload = multer({ storage: multer.memoryStorage() });

import CategoryController from "../controllers/category.controller";
import CourseController from "../controllers/course.controller";
import CourseRepository from "../repositories/course.repository";
import Course from "../models/course.model";
import CourseService from "../services/course.service";
import CategoryRepository from "../repositories/category.repository";
import Category from "../models/category.model";
import Tutor from "../models/tutor.model";
import CategoryService from "../services/category.service";
import TutorRepository from "../repositories/tutor.repository";
// import { isTutorLogin } from "@envy-core/common";

const router = Router();

const courseRepository = new CourseRepository(Course);
const categoryRepository = new CategoryRepository(Category);
const tutorRepository = new TutorRepository(Tutor);

const courseService = new CourseService(courseRepository, tutorRepository);
const categoryService = new CategoryService(categoryRepository);

const categoryController = new CategoryController(categoryService);
const courseController = new CourseController(courseService);

// * Category Routes
router.post("/add_category", categoryController.addCategory);
router.get("/get_categories", categoryController.getCategories);
router.post("/delete_category", categoryController.deleteCategory);

// * AWS S3 Routes

router.get("/get-upload-url", courseController.getS3UploadUrl);
router.get("/get-presigned-url", courseController.getS3PresignedUrl);

// * Course Routes
router.post(
  "/add_course",
  isTutorLogin(Tutor),
  upload.any(),
  courseController.createCourse
);

router.get(
  "/:tutorId/courses/:status",
  courseController.getTutorCoursesByStatus
);

router.get("/get_courses/:status", courseController.getAllCoursesForCards);
router.get("/course_details/:courseId", courseController.getCourseDetails);
router.get("/:courseId/lesson_details", courseController.getLessonDetails)
router.patch("/edit_course/:courseId");
router.delete("/delete_course/:courseId", courseController.deleteCourse);

export default router;
