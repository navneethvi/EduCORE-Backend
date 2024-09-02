import Tutor from "../models/tutor.model";
import {  ITutor } from "../interfaces/tutor.interface";

class TutorRepository {
    public async createTutor(tutorData: ITutor): Promise<ITutor> {
        const tutor = new Tutor(tutorData);
        return await tutor.save();
      }
}

export default TutorRepository