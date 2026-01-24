import { Redis } from "ioredis";
import { logger } from "../utils/logger";

const redisConfig: any = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  maxRetriesPerRequest: null,
};

if (process.env.REDIS_PASSWORD) {
  redisConfig.password = process.env.REDIS_PASSWORD;
}

export const redis = new Redis(redisConfig);

redis.on("connect", () => {
  logger.info("✅ Redis connected");
});

redis.on("error", (err) => {
  logger.error("❌ Redis connection error:", err);
});

redis.on("ready", () => {
  logger.info("✅ Redis is ready");
});
