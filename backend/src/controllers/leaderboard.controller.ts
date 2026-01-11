import { Request, Response } from "express";
import { Stats } from "../models/user/Stats";
import { redis } from "../config/redis";

export const getLeaderboard = async (req: Request, res: Response) => {
    try {
        const CACHE_KEY = "leaderboard:top50";

        // Try to get high-score data from Redis
        const cachedLeaderboard = await redis.get(CACHE_KEY);

        if (cachedLeaderboard) {
            console.log("Leaderboard fetched from Redis cache");
            return res.status(200).json({
                success: true,
                data: JSON.parse(cachedLeaderboard),
            });
        }

        const leaderboard = await Stats.find()
            .sort({ totalSolved: -1, updatedAt: 1 }) // Descending by solved, ascending by time (tie-breaker)
            .limit(50)
            .populate("user", "username avatar") // Populate user details
            .select("-languagesUsed -createdAt -updatedAt -__v"); // Exclude unnecessary fields

        console.log("getLeaderboard Response Data Count:", leaderboard.length);

        // Store in Redis for 10 minutes (600 seconds)
        await redis.set(CACHE_KEY, JSON.stringify(leaderboard), "EX", 600);

        res.status(200).json({
            success: true,
            data: leaderboard,
        });
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
