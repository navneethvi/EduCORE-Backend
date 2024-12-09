import { CourseDocument } from "../models/course.model";
import { ICourse } from "./course.interface";
import { IEnrollment } from "./enrollment.interface";

export interface ICourseRepository {
  findCourse(courseId: string): Promise<boolean>;
  getCourse(courseId: string): Promise<ICourse | null>;
  createCourse(courseData: Partial<CourseDocument>): Promise<ICourse>;
  updateCourse(courseData: Partial<CourseDocument>): Promise<void>;
  getEnrolledCourses(studentId: string): Promise<ICourse[]>;
  getStatsForAdmin(
    groupByFormat: string
  ): Promise<{ courses: ICourse[]; enrollments: IEnrollment[] }>;
  getStatsForTutor(
    tutorId: string,
    groupByFormat: string
  ): Promise<{ courses: ICourse[]; enrollments: IEnrollment[] }>;
}
