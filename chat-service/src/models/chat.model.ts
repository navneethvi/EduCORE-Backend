import { Schema, model } from "mongoose";
import { IChat } from "../interfaces/chat.interface";

const chatSchema = new Schema<IChat>(
  {
    chatMembers: [
      {
        type: Schema.Types.ObjectId,
        refPath: "chatMemberModel",
      },
    ],
    chatMemberModel: [
      {
        type: String,
        required: true,
        enum: ["Student", "Tutor"],
      },
    ],
    lastMessage: {
      type: String,
      default: "",
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Chat = model<IChat>("Chat", chatSchema);

export default Chat;
