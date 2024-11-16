import { Request, Response, NextFunction } from "express";
import { HttpStatusCodes, logger } from "@envy-core/common";
import { IChatService } from "../interfaces/chat.service.interface";

class ChatController {
  private chatService: IChatService;

  constructor(chatService: IChatService) {
    this.chatService = chatService;
  }

  public fetchUsersWithExistingChats = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { userId, userType } = req.body;

    if (!userId || !userType || !["Student", "Tutor"].includes(userType)) {
      return res.status(400).json({
        message: "Invalid input. 'userId' and valid 'userType' are required.",
      });
    }

    try {
      logger.info(`Fetching chats for user: ${userId} as ${userType}`);

      const chats = await this.chatService.getChatsByUser(userId, userType);

      res.status(HttpStatusCodes.OK).json({
        success: true,
        chats,
      });
    } catch (error) {
      logger.error("Error in fetchUsersWithExistingChats:", error);
      next(error);
    }
  };

  public createChatRoom = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { chatMembers, chatMemberModel } = req.body;
      if (
        !chatMembers ||
        !chatMemberModel ||
        chatMembers.length !== chatMemberModel.length
      ) {
        return res.status(400).json({
          message:
            "Invalid input. Both chatMembers and chatMemberModel are required.",
        });
      }
      console.log("passed");

      console.log("chat members==>", chatMembers);
      console.log("chat members model==>", chatMemberModel);
    //   console.log("Chat Members:", [studentData._id, tutorInfo?.tutorId]);


      const response = await this.chatService.createChatRoom(
        chatMembers,
        chatMemberModel
      );

      console.log(response);
    } catch (error) {
      next(error);
    }
  };
}

export default ChatController;
