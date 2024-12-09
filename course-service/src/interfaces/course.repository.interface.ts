import { CourseDocument } from "../models/course.model";
import { CourseForCard, Lesson } from "./course.interface";

export interface ICourseRepository {
  save(courseData: Partial<CourseDocument>): Promise<CourseDocument>;
  findById(courseId: string): Promise<CourseDocument | null>;
  getCoursesByTutor(
    tutor_id: string,
    page: number,
    limit: number,
    isApproved: boolean
  ): Promise<CourseDocument[] | null>;
  countCoursesByTutor(tutor_id: string, isApproved: boolean): Promise<number>;

  getAllCourses(
    isApproved: boolean,
    page: number,
    limit: number,
    skip: number
  ): Promise<CourseForCard[]>;
  getCourseDetails(course_id: string): Promise<CourseDocument | null>;
  deleteCourse(course_id: string): Promise<boolean>;
  getLessonDetails(
    courseId: string,
    lessonIndex: number
  ): Promise<Lesson | null>;
  approveCourse(courseId: string): Promise<boolean>;
  getTrendingCourses(): Promise<CourseDocument[] | undefined>;
  getNewlyAddedCourses(): Promise<CourseDocument[] | undefined>;
  fetchCourses(limit: number, offset: number, searchTerm: string, categories: string | string[], sort: string): Promise<CourseDocument[]>;
  totalCourseCount(): Promise<number>
}
