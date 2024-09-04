import { CourseDocument } from "../models/course.model";
import { CourseForCard } from "./course.interface";

export interface ICourseRepository {
  save(courseData: Partial<CourseDocument>): Promise<CourseDocument>;
  findById(courseId: string): Promise<CourseDocument | null>;
  getCourseByTutor(tutor_id: string): Promise<CourseDocument[] | null>;
  getAllCourses(): Promise<CourseForCard[]>;
  getCourseDetails(course_id: string): Promise<CourseDocument | null>;
}
