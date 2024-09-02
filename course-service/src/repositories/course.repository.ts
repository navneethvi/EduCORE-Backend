import Course, { CourseDocument } from "../models/course.model";

class CourseRepository {
  public async save(courseData: Partial<CourseDocument>): Promise<CourseDocument> {
    const course = new Course(courseData);
    return await course.save();
  }

  public async findById(courseId: string): Promise<CourseDocument | null> {
    return await Course.findById(courseId);
  }

  public async getCourseByTutor(tutor_id : string): Promise<CourseDocument[] | null> {
    return await Course.find({tutor_id : tutor_id})
  }
}

export default CourseRepository;