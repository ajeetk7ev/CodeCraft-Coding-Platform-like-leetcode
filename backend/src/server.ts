import express from "express";
import dotenv from "dotenv";
import { logger } from "./utils/logger";

// 1. Uncaught Exception Handler
process.on("uncaughtException", (err) => {
  logger.error("UNCAUGHT EXCEPTION! ✨ Shutting down...");
  logger.error(err.name, err.message);
  process.exit(1);
});

dotenv.config();
import cors from "cors";
import { createServer } from "http";
import { initSocket } from "./config/socket";
import { dbConnect } from "./config/db";
import authRoutes from "./routes/auth.routes";
import problemRoutes from "./routes/problem.routes";
import submissionRoutes from "./routes/submission.routes";
import userRoutes from "./routes/user.routes";
import adminRoutes from "./routes/admin.routes";
import leaderboardRoutes from "./routes/leaderboard.routes";
import arenaRoutes from "./routes/arena.routes";
import contestRoutes from "./routes/contest.routes";
import discussionRoutes from "./routes/discussion.routes";
import { globalErrorHandler } from "./middlewares/error.middleware";
import helmet from "helmet";
import hpp from "hpp";
import { rateLimit } from "express-rate-limit";

const app = express();
const httpServer = createServer(app);
initSocket(httpServer);

import "./workers/submit.worker"; // Start the submit worker
import "./workers/run.worker"; // Start the run worker

const PORT = process.env.PORT || 5001;

logger.info(`PORT: ${PORT}`);

app.use(express.json());
app.use(cors());

// 1. Security Headers
app.use(helmet());

// 2. Prevent HTTP Parameter Pollution
app.use(hpp());

// 3. Auth Rate Limiting (Stricter)
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 10, // Limit each IP to 10 login/signup attempts per hour
  message: "Too many authentication attempts. Please try again in an hour.",
});
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/signup", authLimiter);

app.get("/", (_, res) => {
  res.send("Server is working fine");
});

app.use("/api/auth", authRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/arena", arenaRoutes);
app.use("/api/contests", contestRoutes);
app.use("/api/discussions", discussionRoutes);

app.use(globalErrorHandler);

const server = httpServer.listen(PORT, async () => {
  await dbConnect();
  logger.info(`Server is running at port ${PORT}`);
});

// 2. Unhandled Rejection Handler
process.on("unhandledRejection", (err: any) => {
  logger.error("UNHANDLED REJECTION! ✨ Shutting down...");
  logger.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// 3. SIGTERM Handler
process.on("SIGTERM", () => {
  logger.info("👋 SIGTERM RECEIVED. Shutting down gracefully");
  server.close(() => {
    logger.info("✨ Process terminated!");
  });
});
