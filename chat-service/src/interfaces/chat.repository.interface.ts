import { IChat } from "./chat.interface";
import { IMessage } from "./message.interface";  

export interface IChatRepository {
  getChatHistory(chatRoomId: string): Promise<IMessage[]>
  getChatRoom(studentId: string, tutorId: string): Promise<IChat | null>
    getChatsByUser(
    userId: string,
    userType: "Student" | "Tutor"
  ): Promise<IChat[]>;
}
