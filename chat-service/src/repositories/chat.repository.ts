import { Model } from "mongoose";
import { IChatRepository } from "../interfaces/chat.repository.interface";
import { logger } from "@envy-core/common";
import { IChat } from "../interfaces/chat.interface";
import { IMessage } from "../interfaces/message.interface";

class ChatRepository implements IChatRepository {
  private readonly chatModel: Model<IChat>;
  private readonly messageModel: Model<IMessage>;

  constructor(ChatModel: Model<IChat>, MessageModel: Model<IMessage>) {
    this.chatModel = ChatModel;
    this.messageModel = MessageModel;
  }

  async getChatsByUser(
    userId: string,
    userType: "Student" | "Tutor"
  ): Promise<IChat[]> {
    try {
      const chats = await this.chatModel
        .find({
          chatMembers: userId,
          chatMemberModel: userType,
        })
        .populate("chatMembers"); 
  
      return chats;
    } catch (error) {
      logger.error("Error in ChatRepository.getChatsByUser:", error);
      throw error;
    }
  }


}

export default ChatRepository;
