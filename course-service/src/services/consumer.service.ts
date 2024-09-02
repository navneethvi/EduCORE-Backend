import { ITutor } from "../interfaces/tutor.interface";
import TutorRepository from "../repositories/tutor.repository";

class ConsumerService {
    private tutorRepository = new TutorRepository()
    
    public async createTutor(tutorData: ITutor): Promise<void> {
        
        console.log(tutorData);

        await this.tutorRepository.createTutor(tutorData)
        

    }
}

export default ConsumerService