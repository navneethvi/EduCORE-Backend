import { Server, Socket } from "socket.io";

export default function registerSocketHandlers(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("join-room", (roomId: string) => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined room ${roomId}`);
    });

    socket.on("send-message", (roomId: string, message: string) => {
      io.to(roomId).emit("receive-message", message);
    });

    socket.on("connect_error", (error) => {
      console.error("Connection error:", error);
    });
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
}
