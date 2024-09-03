import { CourseForCard, CreateCourseRequest } from "./course.interface";
import { Course } from "./course.interface";

export interface ICourseService {
  createCourse(req: CreateCourseRequest): Promise<string>;
  getCourseById(courseId: string): Promise<Course>;
  getTutorCourse(tutorId: string): Promise<Course[]>;
  getAllCoursesForCards(): Promise<CourseForCard[]>;
}
