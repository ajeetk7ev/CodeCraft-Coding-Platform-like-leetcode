import { Queue } from "bullmq";
import { redis } from "../config/redis";

export const submitQueue = new Queue("code-submit", {
  connection: redis,
});
