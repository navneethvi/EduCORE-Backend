import { CourseDocument } from "../models/course.model";
import { ICourse } from "./course.interface";

export interface ICourseRepository {
  findCourse(courseId: string): Promise<boolean>;
  getCourse(courseId: string): Promise<ICourse | null>
  createCourse(courseData: Partial<CourseDocument>): Promise<ICourse>;
  updateCourse(courseData: Partial<CourseDocument>): Promise<void>
  getEnrolledCourses(studentId: string): Promise<ICourse[]>
}
