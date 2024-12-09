import { IChat } from "./chat.interface";
import { IMessage } from "./message.interface";

export interface IChatService {
  getChatsByUser(
    userId: string,
    userType: "Student" | "Tutor"
  ): Promise<IChat[]>;
  createChatRoom(
    chatMembers: string[],
    chatMemberModel: string[]
  ): Promise<IChat>;
  getChatHistory(studentId: string, tutorId: string): Promise<{ chatRoom: IChat; messages: IMessage[] }>;
}
