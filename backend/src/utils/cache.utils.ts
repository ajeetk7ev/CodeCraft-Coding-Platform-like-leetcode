import { redis } from "../config/redis";

/**
 * Clears Redis keys matching a pattern using SCAN to avoid blocking.
 * @param pattern The pattern to match keys (e.g., "problem:list:*")
 */
export const clearCache = async (pattern: string): Promise<void> => {
    try {
        let cursor = "0";
        do {
            const result = await redis.scan(cursor, "MATCH", pattern, "COUNT", 100);
            cursor = result[0];
            const keys = result[1];

            if (keys.length > 0) {
                await redis.del(...keys);
            }
        } while (cursor !== "0");

        console.log(`✅ Cache cleared for pattern: ${pattern}`);
    } catch (error) {
        console.error(`❌ Error clearing cache for pattern ${pattern}:`, error);
    }
};
