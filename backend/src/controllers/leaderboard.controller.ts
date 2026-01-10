import { Request, Response } from "express";
import { Stats } from "../models/user/Stats";

export const getLeaderboard = async (req: Request, res: Response) => {
    try {
        const leaderboard = await Stats.find()
            .sort({ totalSolved: -1, updatedAt: 1 }) // Descending by solved, ascending by time (tie-breaker)
            .limit(50)
            .populate("user", "username avatar") // Populate user details
            .select("-languagesUsed -createdAt -updatedAt -__v"); // Exclude unnecessary fields

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
