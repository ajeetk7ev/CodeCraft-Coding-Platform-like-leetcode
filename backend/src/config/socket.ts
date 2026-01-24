import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { logger } from "../utils/logger";

let io: Server;

export const initSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    logger.info(`A user connected: ${socket.id}`);

    socket.on("join_contest", (contestId) => {
      socket.join(`contest_${contestId}`);
      logger.info(`User ${socket.id} joined contest_${contestId}`);
    });

    socket.on("disconnect", () => {
      logger.info(`User disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  return io; // Can be undefined initially
};
