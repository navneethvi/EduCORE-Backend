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

  public async getTutors(
    page = 1,
    limit = 5,
    searchTerm = ""
  ): Promise<ITutor[]> {
    console.log("page in repo ==>", page);

    const skip = (page - 1) * limit;
    const query = searchTerm
      ? { name: { $regex: searchTerm, $options: "i" } }
      : {};
    return await Tutor.find(query).skip(skip).limit(limit).exec();
  }

  public async countTutors(searchTerm = ""): Promise<number> {
    const query = searchTerm
      ? { name: { $regex: searchTerm, $options: "i" } }
      : {};
    return await Tutor.countDocuments(query).exec();
  }

  async updateTutorStatus(tutorId: string, is_blocked: boolean): Promise<void> {
    await Tutor.findByIdAndUpdate(tutorId, { is_blocked });
  }

  async getTutorById(tutorId: string): Promise<ITutor | null> {
    return Tutor.findById(tutorId);
  }
}

export default TutorRepository;
