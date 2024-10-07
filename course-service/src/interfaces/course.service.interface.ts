import {
  CourseForCard,
  CourseWithTutor,
  CreateCourseRequest,
  PaginatedData,
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
}
