import { Model } from "mongoose";
import { ITutorRepository } from "../interfaces/tutor.repository.interface";
import { ITutor } from "../interfaces/tutor.interface";
import { logger } from "@envy-core/common";

class TutorRepository implements ITutorRepository {
  private readonly tutorModel: Model<ITutor>;

  constructor(tutorModel: Model<ITutor>) {
    this.tutorModel = tutorModel;
  }

  public async findTutor(tutor_id: string): Promise<ITutor | null> {
    try {
      return await this.tutorModel.findOne({ _id: tutor_id }).exec();
    } catch (error) {
      logger.error(`Error finding tutor: ${error}`);
      throw new Error("Error finding tutor");
    }
  }

  public async createTutor(tutorData: ITutor): Promise<ITutor> {
    try {
      const tutor = new this.tutorModel(tutorData);
      return await tutor.save();
    } catch (error) {
      logger.error(`Error creating tutor: ${error}`);
      throw new Error("Error creating tutor");
    }
  }
}

export default TutorRepository;
