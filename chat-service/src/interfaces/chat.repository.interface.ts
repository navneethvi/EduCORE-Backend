import { IChat } from "./chat.interface";

export interface IChatRepository {

  getChatsByUser(userId: string, userType: "Student" | "Tutor"): Promise<IChat[]>;
}
