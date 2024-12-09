import { logger } from "@envy-core/common";
import { IChatRepository } from "../interfaces/chat.repository.interface";
import { IChat } from "../interfaces/chat.interface";
import { IChatService } from "../interfaces/chat.service.interface";
import { Model } from "mongoose";
import { IMessage } from "../interfaces/message.interface";
// import { IMessage } from "../interfaces/message.interface";
// import { IMessage } from "../interfaces/message.interface";

class ChatService implements IChatService {
  private chatRepository: IChatRepository;
  private readonly chatModel: Model<IChat>;

  constructor(chatRepository: IChatRepository, chatModel: Model<IChat>) {
    this.chatRepository = chatRepository;
    this.chatModel = chatModel;
  }

  public async getChatsByUser(
    userId: string,
    userType: "Student" | "Tutor"
  ): Promise<IChat[]> {
    try {
      const chats = await this.chatRepository.getChatsByUser(userId, userType);

      return chats;
    } catch (error) {
      logger.error("Error in ChatService.getChatsByUser:", error);
      throw error;
    }
  }

  public async createChatRoom(
    chatMembers: string[],
    chatMemberModel: string[]
  ): Promise<IChat> {
    try {
      if (chatMembers.length !== chatMemberModel.length) {
        throw new Error(
          "Chat members and chat member models must have the same length."
        );
      }

      const chatData = { chatMembers, chatMemberModel };

      const chat = await this.chatModel.create(chatData);
      return chat;
    } catch (error) {
      logger.error("Error creating chat room:", error);
      throw error;
    }
  }

  public async getChatHistory(
    studentId: string,
    tutorId: string
  ): Promise<{ chatRoom: IChat; messages: IMessage[] }> {
    try {
      const chatRoom = await this.chatRepository.getChatRoom(
        studentId,
        tutorId
      );

      if (!chatRoom) {
        throw new Error("Chat room not found.");
      }

      const messages = await this.chatRepository.getChatHistory(chatRoom._id);
      return { chatRoom, messages };
    } catch (error) {
      console.error("Error in getChatHistory service:", error);
      throw new Error("Could not retrieve chat history.");
    }
  }
}

export default ChatService;
