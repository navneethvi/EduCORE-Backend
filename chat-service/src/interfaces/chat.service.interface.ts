import { IChat } from "./chat.interface";
// import { IMessage } from "./message.interface";

export interface IChatService {

  getChatsByUser(userId: string, userType: "Student" | "Tutor"): Promise<IChat[]>;
  createChatRoom(chatMembers: string[], chatMemberModel: string[]): Promise<IChat>;

//   sendMessage(
//     chatRoomId: string,
//     messageBy: string,
//     messageByModel: "Student" | "Tutor",
//     content: string
//   ): Promise<IMessage>;
}
