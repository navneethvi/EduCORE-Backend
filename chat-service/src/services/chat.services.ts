import { logger } from "@envy-core/common";
import { IChatRepository } from "../interfaces/chat.repository.interface";
import { IChat } from "../interfaces/chat.interface";
import { IChatService } from "../interfaces/chat.service.interface";
import { Model } from "mongoose";
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

  //   public async sendMessage(
  //     chatRoomId: string,
  //     messageBy: string,
  //     messageByModel: "Student" | "Tutor",
  //     content: string
  //   ): Promise<IMessage> {
  //     try {
  //       // Create a new message
  //     //   const newMessage = new this.chatRepository.messageModel({
  //     //     chatRoom: chatRoomId,
  //     //     messageBy,
  //     //     messageByModel,
  //     //     content,
  //     //   });

  //       // Save the message in the database
  //     //   await newMessage.save();

  //       // Optionally, update the chat room with the last message
  //       const chat = await this.chatRepository.chatModel.findById(chatRoomId);
  //       if (chat) {
  //         chat.lastMessage = content;
  //         chat.lastMessageAt = new Date();
  //         await chat.save();
  //       }

  //       // Return the newly created message
  //     //   return newMessage;
  //     } catch (error) {
  //       logger.error("Error sending message:", error);
  //       throw error;
  //     }
  //   }
}

export default ChatService;
