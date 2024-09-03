import { ITutor } from "../interfaces/tutor.interface";
import { IConsumerService } from "../interfaces/consumer.service.interface";
import { ITutorRepository } from "../interfaces/tutor.repository.interface";

class ConsumerService implements IConsumerService {
  private tutorRepository: ITutorRepository;

  constructor(tutorRepository: ITutorRepository) {
    this.tutorRepository = tutorRepository;
  }

  public async createTutor(tutorData: ITutor): Promise<void> {
    console.log(tutorData);

    await this.tutorRepository.createTutor(tutorData);
  }
}

export default ConsumerService;
