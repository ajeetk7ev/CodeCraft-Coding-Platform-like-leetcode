import { Redis } from "ioredis";

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
  console.log("✅ Redis connected");
});

redis.on("error", (err) => {
  console.error("❌ Redis connection error:", err);
});

redis.on("ready", () => {
  console.log("✅ Redis is ready");
});