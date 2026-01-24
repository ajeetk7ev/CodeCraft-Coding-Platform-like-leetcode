import { Request, Response } from "express";
import { logger } from "../utils/logger";
import { Stats } from "../models/user/Stats";
import { catchAsync } from "../utils/catchAsync";

export const getLeaderboard = catchAsync(
  async (req: Request, res: Response) => {
    const leaderboard = await Stats.find()
      .sort({ totalSolved: -1, updatedAt: 1 }) // Descending by solved, ascending by time (tie-breaker)
      .limit(50)
      .populate("user", "username avatar") // Populate user details
      .select("-languagesUsed -createdAt -updatedAt -__v"); // Exclude unnecessary fields

    logger.info(`getLeaderboard Response Data Count: ${leaderboard.length}`);

    res.status(200).json({
      success: true,
      data: leaderboard,
    });
  },
);
