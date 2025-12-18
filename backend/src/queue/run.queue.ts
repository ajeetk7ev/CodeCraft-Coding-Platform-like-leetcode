import { Queue } from "bullmq";
import { redis } from "../config/redis";

export const runQueue = new Queue("code-run", {
  connection: redis,
});
