import { Schema, model } from "mongoose";
import { IMessage } from "../interfaces/message.interface";

const messageSchema = new Schema<IMessage>(
  {
    messageBy: {
      type: Schema.Types.ObjectId,
      refPath: "messageByModel", 
      required: true,
    },
    messageByModel: {
      type: String,
      required: true,
      enum: ["Student", "Tutor"], 
    },
    content: {
      type: String,
      required: true,
    },
    chatRoom: {
      type: Schema.Types.ObjectId,
      ref: "Chat", 
      required: true,
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

const Message = model<IMessage>("Message", messageSchema);


export default Message;
