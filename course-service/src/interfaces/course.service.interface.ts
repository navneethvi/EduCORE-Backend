import {
  CourseForCard,
  CourseWithTutor,
  CreateCourseRequest,
  Lesson,
  PaginatedData,
  SimplifiedCourse,
} from "./course.interface";
import { Course } from "./course.interface";

export interface ICourseService {
  createCourse(req: CreateCourseRequest): Promise<string>;
  getCourseById(courseId: string): Promise<Course>;
  getTutorCourses(
    tutorId: string,
    page: number,
    limit: number,
    isApproved: boolean
  ): Promise<PaginatedData<Course>>;
  getAllCoursesForCards(
    isApproved: boolean,
    page: number,
    limit: number
  ): Promise<CourseForCard[]>;
  getCourseDetails(course_id: string): Promise<CourseWithTutor>;
  deleteCourse(course_id: string): Promise<boolean>;
  getLessonDetails(
    courseId: string,
    lessonIndex: number
  ): Promise<Lesson | null>;
  approveCourse(courseId: string): Promise<boolean>;
  getTrendingCourses(): Promise<Course[] | undefined>;
  getNewlyAddedCourses(): Promise<Course[] | undefined>;
  updateCourse(courseId: string, editedCourse: Course): Promise<Course | null>;
  fetchCourses(limit: number, offset: number, searchTerm: string, categories: string[], sort: string): Promise<SimplifiedCourse[]>
}
