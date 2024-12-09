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
        .populate("chatMembers")
        .sort({ lastMessageAt: -1 }); 
  
      return chats;
    } catch (error) {
      logger.error("Error in ChatRepository.getChatsByUser:", error);
      throw error;
    }
  }
  

  public async getChatRoom(
    studentId: string,
    tutorId: string
  ): Promise<IChat | null> {
    try {
      const chatRoom = await this.chatModel.findOne({
        chatMembers: { $all: [studentId, tutorId] },
        chatMemberModel: { $all: ["Student", "Tutor"] }, 
      });

      // console.log("chatRoom found=====>", chatRoom);

      return chatRoom;
    } catch (error) {
      console.error("Error in getChatRoom:", error);
      throw error;
    }
  }

  async getChatHistory(chatRoomId: string): Promise<IMessage[]> {
    try {
      const chatHistory = await this.messageModel
        .find({ chatRoom: chatRoomId })
        .populate([
          { path: "messageBy", model: "Student" },
          { path: "messageBy", model: "Tutor" },
        ]);

      // console.log("history fetched======>", chatHistory);

      return chatHistory;
    } catch (error) {
      console.error("Error in getChatHistory:", error);
      throw error;
    }
  }

  public async saveMessages(
    message: string,
    roomId: string,
    sender: string,
    senderType: string
  ): Promise<IMessage | null> {
    try {
      const roomFound = await this.chatModel.findOne({ _id: roomId });
      if (!roomFound) {
        console.log("Room does not exist");
        return null;
      }
  
      // Save the new message
      const savedMessage = await this.messageModel.create({
        chatRoom: roomId,
        messageBy: sender,
        messageByModel: senderType,
        content: message,
      });
      console.log("Message saved:", savedMessage);
  
      // Update the chat room with the new message details
      const updatedChat = await this.chatModel.findByIdAndUpdate(
        roomId,
        {
          lastMessage: message, // Update lastMessage field with the new message
          lastMessageAt: new Date(), // Set the current time as lastMessageAt
        },
        { new: true } // To return the updated chat document
      );
  
      console.log("Chat updated:", updatedChat);
      return savedMessage;
    } catch (error) {
      console.error("Error Saving message:", error);
      throw error;
    }
  }
  
}

export default ChatRepository;
