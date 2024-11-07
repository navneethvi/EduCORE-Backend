import mongoose, { Model } from "mongoose";
import { ICourse } from "../interfaces/course.interface";
import { logger } from "@envy-core/common";
import { ICourseRepository } from "../interfaces/course.repository.interface";
import { CourseDocument } from "../models/course.model";

class CourseRepository implements ICourseRepository {
  private readonly courseModel: Model<CourseDocument>;

  constructor(CourseModel: Model<CourseDocument>) {
    this.courseModel = CourseModel;
  }

  public async findCourse(courseId: string): Promise<boolean> {
    try {
      console.log("courseId in findCourse repo====>", courseId);
      
      const finded =  await this.courseModel.findOne({ _id: courseId }).exec();

      console.log(finded);

      return !!finded;
      
    } catch (error) {
      logger.error(`Error finding Course: ${error}`);
      throw new Error("Error finding Course");
    }
  }

  public async createCourse(courseData: CourseDocument): Promise<ICourse> {
    try {
      console.log("course before saving", courseData);
      const editedData = courseData.edited;

      console.log("edited data=>", editedData);
      

      const sanitizedData: Partial<CourseDocument> = {
        _id: editedData._id ? new mongoose.Types.ObjectId(editedData._id) : undefined,
        title: editedData.title,
        description: editedData.description,
        category: editedData.category,
        level: editedData.level,
        thumbnail: editedData.thumbnail,
        tutor_id: editedData.tutor_id, 
        is_approved: editedData.is_approved,
        enrollments: editedData.enrollments || 0,
        price: editedData.price,
        lessons: editedData.lessons, 
      };

      console.log(
        "sanitizedData before saving:",
        JSON.stringify(sanitizedData, null, 2)
      );

      const course = new this.courseModel(sanitizedData);
      const after = await course.save();

      console.log("course after saving", after);
      return after;
    } catch (error) {
      logger.error(`Error creating Course: ${error}`);
      throw new Error("Error creating Course");
    }
  }

  public async updateCourse(
    courseData: Partial<CourseDocument>
  ): Promise<void> {

    if (!courseData.edited || !courseData.edited._id) {
      throw new Error("Course ID is required for updating");
    }    
    const updatedCourse = await this.courseModel
    .findByIdAndUpdate(courseData.edited._id, courseData.edited, {
      new: true, 
    })
    .exec();

    if (!updatedCourse) {
      throw new Error(`Course with ID ${courseData.edited._id} not found.`);
    }
  
    console.log("Updated Course:", updatedCourse);
  }
}

export default CourseRepository;
