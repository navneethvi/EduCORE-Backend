import { Model } from "mongoose";
import { INewTutor, ITutor } from "../interfaces/tutor.interface";
import { ITutorRepository } from "../interfaces/tutor.repository.interface";

class TutorRepository implements ITutorRepository {
  private readonly tutorModel: Model<ITutor>;

  constructor(tutorModel: Model<ITutor>) {
    this.tutorModel = tutorModel;
  }

  public async findTutor(email: string): Promise<ITutor | null> {
    return await this.tutorModel.findOne({ email }).exec();
  }

  public async getTutor(tutorId: string): Promise<ITutor | null> {
    console.log("tutorId in repo==>", tutorId);

    return await this.tutorModel.findById(tutorId).exec();
  }

  public async createTutor(tutorData: INewTutor): Promise<ITutor> {
    const tutor = new this.tutorModel(tutorData);
    return await tutor.save();
  }

  public async getTutors(
    page = 1,
    limit = 5,
    searchTerm = ""
  ): Promise<ITutor[]> {
    const skip = (page - 1) * limit;
    const query = searchTerm
      ? { name: { $regex: searchTerm, $options: "i" } }
      : {};
    return await this.tutorModel.find(query).skip(skip).limit(limit).exec();
  }

  public async countTutors(searchTerm = ""): Promise<number> {
    const query = searchTerm
      ? { name: { $regex: searchTerm, $options: "i" } }
      : {};
    return await this.tutorModel.countDocuments(query).exec();
  }

  async updateTutorStatus(tutorId: string, is_blocked: boolean): Promise<void> {
    await this.tutorModel.findByIdAndUpdate(tutorId, { is_blocked });
  }

  async getTutorById(tutorId: string): Promise<ITutor | null> {
    return this.tutorModel.findById(tutorId);
  }
}

export default TutorRepository;
