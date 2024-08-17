import { INewTutor, ITutor } from "../interfaces/tutor.interface";
import Tutor from "../models/tutor.model";

import { ITutorRepository } from "../interfaces/tutor.repository.interface";

class TutorRepository implements ITutorRepository {
  public async findTutor(email: string): Promise<ITutor | null> {
    return await Tutor.findOne({ email }).exec();
  }

  public async createTutor(tutorData: INewTutor): Promise<ITutor> {
    const tutor = new Tutor(tutorData);
    return await tutor.save();
  }

  public async getTutors(page = 1, limit = 5): Promise<ITutor[]> {
    console.log("page in repo ==>", page);

    const skip = (page - 1) * limit;
    return await Tutor.find().skip(skip).limit(limit).exec();
  }

  public async countTutors(): Promise<number> {
    return await Tutor.countDocuments().exec();
  }
}

export default TutorRepository;
