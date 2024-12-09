import { Router } from "express";
import multer from "multer";

import { isTutorLogin, isAdminLogin, isStudentLogin } from "@envy-core/common";

// import { eitherOrAuth } from "@envy-core/common";

const upload = multer({ storage: multer.memoryStorage() });

import CategoryController from "../controllers/category.controller";
import CourseController from "../controllers/course.controller";
import CourseRepository from "../repositories/course.repository";
import CourseService from "../services/course.service";
import CategoryRepository from "../repositories/category.repository";
import Category from "../models/category.model";
import Course from "../models/course.model";

import Tutor from "../models/tutor.model";
import Admin from "../models/admin.model";
import Student from "../models/student.model";

import CategoryService from "../services/category.service";
import TutorRepository from "../repositories/tutor.repository";
import TutorService from "../services/tutor.service";
import ConsumerService from "../services/consumer.service";
import StudentRepository from "../repositories/student.repository";
import ReviewRepository from "../repositories/review.repository";
import Review from "../models/review.model";

const router = Router();

const courseRepository = new CourseRepository(Course);
const categoryRepository = new CategoryRepository(Category);
const tutorRepository = new TutorRepository(Tutor);
const studentRepository = new StudentRepository(Student);
const reviewRepository = new ReviewRepository(Review, Tutor, Student, Course);

const courseService = new CourseService(
  courseRepository,
  tutorRepository,
  reviewRepository
);
const categoryService = new CategoryService(categoryRepository);
const tutorService = new TutorService(tutorRepository);
const consumerService = new ConsumerService(tutorRepository, studentRepository);

const categoryController = new CategoryController(categoryService);
const courseController = new CourseController(
  courseService,
  categoryService,
  tutorService,
  consumerService
);

// * Category Routes
router.post(
  "/add_category",
  isAdminLogin(Admin),
  categoryController.addCategory
);
router.get("/get_categories", categoryController.getCategories);
router.get("/get_allcategories", categoryController.getAllCategories);
router.post(
  "/delete_category",
  isAdminLogin(Admin),
  categoryController.deleteCategory
);

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

router.get("/homepage", courseController.dataForHome);

router.get("/get_courses/:status", courseController.getAllCoursesForCards);
router.get("/course_details/:courseId", courseController.getCourseDetails);
router.post("/:courseId/lesson_details", courseController.getLessonDetails);
router.patch(
  "/edit_course/:courseId",
  upload.any(),
  courseController.editCourse
);
router.patch("/approve_course/:courseId", courseController.approveCourse);
router.delete("/delete_course/:courseId", courseController.deleteCourse);
router.get("/fetch_courses", courseController.fetchCourses);

router.post(
  "/add-review",
  isStudentLogin(Student),
  courseController.createReview
);

router.get("/get-reviews", courseController.getReviewsByCourse);
router.get("/reviews-home", courseController.getReviewsForHome);
router.get("/newly-added-course", courseController.getNewlyAddedCourses)

// * Datas for dashboard

router.get("/admin-dash", courseController.getDatasForAdminDashboard);

router.get(
  "/tutor-dash",
  isTutorLogin(Tutor),
  courseController.getDatasForTutorDashboard
);

export default router;
