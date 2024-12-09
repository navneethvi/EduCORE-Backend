import { ITutor } from "../interfaces/tutor.interface";
import { ITutorRepository } from "../interfaces/tutor.repository.interface";
import { ITutorService } from "../interfaces/tutor.service.interface";

class TutorService implements ITutorService {
  private tutorRepository: ITutorRepository;

  constructor(tutorRepository: ITutorRepository) {
    this.tutorRepository = tutorRepository;
  }

  public async findTutor(tutor_id: string): Promise<ITutor | null> {
   return await this.tutorRepository.findTutor(tutor_id);
  }
  public async totalTutorCount(): Promise<number> {
      return await this.tutorRepository.totalTutorCount()
  }
}

export default TutorService;
