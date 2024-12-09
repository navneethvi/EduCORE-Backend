import { Server, Socket } from "socket.io";
import { chatRepository } from "../routes/chat.routes";

// Move activeUsers map outside of connection handler
const activeUsers = new Map<string, string>();

export default function registerSocketHandlers(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    // User joins a room
    socket.on("join-room", (roomId: string) => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined room ${roomId}`);
    });

    // Handle sending message
    socket.on(
      "send-message",
      async (messagePayload: {
        roomId: string;
        chatId: string;
        message: string;
        sender: string;
        senderType: string;
      }) => {
        console.log("Received payload:", messagePayload);

        const { chatId, roomId, message, sender, senderType } = messagePayload;

        try {
          const savedMessage = await chatRepository.saveMessages(
            message,
            roomId,
            sender,
            senderType
          );

          if (savedMessage) {
            io.to(chatId).emit("receive-message", {
              content: message,
              sender: sender,
              messageBy: savedMessage.messageBy || sender,
              senderType: senderType || "Unknown",
              createdAt: savedMessage.createdAt || new Date().toISOString(),
            });
          } else {
            console.log("Message not saved, room does not exist.");
          }
        } catch (error) {
          console.error("Error handling send-message:", error);
        }
      }
    );

    // Mark user as active
    socket.on("user-active", (userId) => {
      console.log(`user-active: ${userId}, socketId: ${socket.id}`);
      if (userId && !activeUsers.has(userId)) {
        activeUsers.set(userId, socket.id);
        io.emit("update-active-users", Array.from(activeUsers.keys()));
        console.log("active-users after adding:", activeUsers);
      }
    });

    // Mark user as inactive
    socket.on("user-inactive", (userId) => {
      console.log(`user-inactive: ${userId}`);
      if (userId && activeUsers.has(userId)) {
        activeUsers.delete(userId);
        io.emit("update-active-users", Array.from(activeUsers.keys()));
        console.log("active-users after removing:", activeUsers);
      }
    });

    // socket.on("typing", (roomId, userId) => {
    //   console.log(`${userId} is typing in room ${roomId}`);
    //   socket.to(roomId).emit("show-typing", { roomId, userId }); // Notify others in the room
    // });
    
    // socket.on("stop-typing", (roomId, userId) => {
    //   console.log(`${userId} stopped typing in room ${roomId}`);
    //   socket.to(roomId).emit("hide-typing", { roomId, userId }); // Notify others in the room
    // });
    

    // Handle socket disconnections
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
      // Remove user from active users on disconnect
      let userIdToRemove: string | undefined;
      activeUsers.forEach((socketId, userId) => {
        if (socketId === socket.id) {
          userIdToRemove = userId;
        }
      });

      if (userIdToRemove) {
        activeUsers.delete(userIdToRemove);
        io.emit("update-active-users", Array.from(activeUsers.keys()));
        console.log("active-users after disconnect:", activeUsers);
      }
    });

    // Error handling for connection
    socket.on("connect-error", (error) => {
      console.error("Connection error:", error);
    });
  });
}
